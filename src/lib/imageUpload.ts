/**
 * Serviço para upload de imagens para o ImgBB.com
 * Implementado de acordo com a documentação oficial: https://api.imgbb.com/
 */

/**
 * Interface para a resposta da API do ImgBB
 */
interface ImgBBResponse {
  data?: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    delete_url: string;
    thumb?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
  };
  success: boolean;
  status: number;
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Faz upload de uma imagem base64 para o ImgBB.com e retorna a URL
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
    // Remover o prefixo data:image se existir
    const base64Data = base64Image.includes('data:image') 
      ? base64Image.split(',')[1] 
      : base64Image;

    // API key pública apenas para fins de demonstração
    // Em produção, você deve usar sua própria API key ou outro serviço
    const API_KEY = 'e4acb7899125839e54f82f9024ef9078';

    // Criar o FormData para enviar a imagem
    const formData = new FormData();
    formData.append('image', base64Data);
    
    // De acordo com a documentação, a API key e expiration devem ser passados como parâmetros na URL
    const url = `https://api.imgbb.com/1/upload?key=${API_KEY}&expiration=600`;
    
    // De acordo com a documentação, sempre usar POST para upload de arquivos
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // Verificar se a resposta HTTP foi bem-sucedida
    if (!response.ok) {
      console.error(`Erro HTTP: ${response.status} ${response.statusText}`);
      return {
        url: '',
        success: false,
        error: `Erro HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    const data = await response.json() as ImgBBResponse;

    if (data.success) {
      return {
        url: data.data.url,
        display_url: data.data.display_url,
        delete_url: data.data.delete_url,
        thumb_url: data.data.thumb?.url,
        success: true,
      };
    } else {
      console.error('Erro ao fazer upload da imagem:', data);
      return {
        url: '',
        success: false,
        error: `Erro ${data.status || 'desconhecido'}: ${data.error?.message || 'Falha no upload da imagem'}`,
      };
    }
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return {
      url: '',
      success: false,
      error: error.message || 'Erro desconhecido ao fazer upload da imagem',
    };
  }
}
