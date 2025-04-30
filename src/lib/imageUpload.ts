/**
 * Serviço para upload de imagens para o Cloudinary
 * Implementado usando Fetch API para compatibilidade com o navegador
 */

// Configuração do Cloudinary
const CLOUD_NAME = 'djvsguk6m';
const API_KEY = '489526795599656';

/**
 * Interface para a resposta da API do Cloudinary
 */
interface CloudinaryResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  original_filename: string;
  error?: {
    message: string;
  };
}

/**
 * Faz upload de uma imagem base64 para o Cloudinary e retorna a URL
 * @param base64Image Imagem em formato base64 (com ou sem o prefixo data:image)
 * @returns Objeto com a URL da imagem e outras informações
 */
export async function uploadImageToImgBB(base64Image: string): Promise<{
  url: string;
  display_url?: string;
  delete_url?: string;
  thumb_url?: string;
  success: boolean;
  error?: string;
}> {
  try {
    // Extrair a parte base64 da string
    const base64Data = base64Image.includes('data:image') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    // Criar FormData para enviar para o Cloudinary
    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('api_key', API_KEY);
    formData.append('upload_preset', 'chat_simulator'); // Crie um upload_preset no dashboard do Cloudinary
    formData.append('folder', 'chat_simulator');

    // URL de upload do Cloudinary (API pública)
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    // Fazer upload da imagem usando fetch
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    // Verificar se a resposta HTTP foi bem-sucedida
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro HTTP: ${response.status} ${response.statusText}`, errorText);
      return {
        url: '',
        success: false,
        error: `Erro HTTP ${response.status}: ${errorText || response.statusText}`,
      };
    }
    
    const result = await response.json() as CloudinaryResponse;

    // Criar URL de thumbnail
    const thumbUrl = result.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/');

    return {
      url: result.secure_url,
      display_url: result.secure_url,
      thumb_url: thumbUrl,
      delete_url: '', // Cloudinary não fornece URL de exclusão no mesmo formato
      success: true,
    };
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return {
      url: '',
      success: false,
      error: error.message || 'Erro desconhecido ao fazer upload da imagem'
    };
  }
}
