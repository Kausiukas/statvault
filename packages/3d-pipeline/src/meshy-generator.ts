/**
 * StatVault 3D Pipeline: Meshy AI 3D Generator & Animator
 * Automates Text-to-3D, PBR Refine, Auto-Rigging, and Skeletal Animation workflows.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

export interface MeshyConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TextTo3DParams {
  prompt: string;
  artStyle?: 'realistic' | 'sculpture' | 'pbr' | 'cartoon';
  negativePrompt?: string;
  seed?: number;
}

export interface TaskStatusResponse {
  id: string;
  type: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  progress: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usdz?: string;
    obj?: string;
    stl?: string;
  };
  result?: {
    rigged_character_fbx_url?: string;
    rigged_character_glb_url?: string;
    basic_animations?: {
      walking_glb_url?: string;
      running_glb_url?: string;
      walking_fbx_url?: string;
      running_fbx_url?: string;
    };
  };
  task_error?: {
    message: string;
  } | null;
}

export class MeshyClient {
  private apiKey: string;
  private hostname: string;

  constructor(config: MeshyConfig) {
    this.apiKey = config.apiKey;
    this.hostname = config.baseUrl || 'api.meshy.ai';
  }

  private request<T>(endpoint: string, method: 'GET' | 'POST', body?: object): Promise<T> {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const headers: Record<string, string | number> = {
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'StatVault-3DPipeline/1.0.2',
      };

      if (payload) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = https.request(
        {
          hostname: this.hostname,
          path: endpoint,
          method,
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data) as T);
              } catch (e) {
                resolve(data as unknown as T);
              }
            } else {
              reject(new Error(`Meshy API error [${res.statusCode}]: ${data}`));
            }
          });
        }
      );

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  /**
   * Phase 1: Create Text-to-3D Preview Task
   */
  async createPreview(params: TextTo3DParams): Promise<string> {
    const res = await this.request<{ result: string }>('/openapi/v2/text-to-3d', 'POST', {
      mode: 'preview',
      prompt: params.prompt,
      art_style: params.artStyle || 'realistic',
      negative_prompt: params.negativePrompt || 'low quality, low resolution, deformed, blurry',
      seed: params.seed,
    });
    return res.result;
  }

  /**
   * Phase 2: Create PBR Texture Refine Task
   */
  async createRefine(previewTaskId: string): Promise<string> {
    const res = await this.request<{ result: string }>('/openapi/v2/text-to-3d', 'POST', {
      mode: 'refine',
      preview_task_id: previewTaskId,
    });
    return res.result;
  }

  /**
   * Phase 3: Create Auto-Rigging & Basic Animation Task
   */
  async createRigging(modelUrl: string): Promise<string> {
    const res = await this.request<{ result: string }>('/openapi/v1/rigging', 'POST', {
      model_url: modelUrl,
    });
    return res.result;
  }

  /**
   * Poll task until completion
   */
  async pollTask(
    taskId: string,
    type: 'v2/text-to-3d' | 'v1/rigging' = 'v2/text-to-3d',
    onProgress?: (p: number, status: string) => void,
    intervalMs: number = 5000,
    maxAttempts: number = 60
  ): Promise<TaskStatusResponse> {
    const endpoint = `/openapi/${type}/${taskId}`;

    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.request<TaskStatusResponse>(endpoint, 'GET');
      if (onProgress) {
        onProgress(status.progress, status.status);
      }

      if (status.status === 'SUCCEEDED') {
        return status;
      }
      if (status.status === 'FAILED' || status.status === 'EXPIRED') {
        throw new Error(`Task failed: ${status.task_error?.message || status.status}`);
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`Task timed out after ${maxAttempts * intervalMs} ms`);
  }

  /**
   * Download model to disk
   */
  downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      https
        .get(url, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        })
        .on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
    });
  }
}
