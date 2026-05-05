/**
 * Comprime e redimensiona uma imagem no navegador, devolvendo data URL (base64).
 * Permite armazenar a foto direto no Firestore (sem Firebase Storage),
 * dentro do limite de 1MB por documento.
 *
 * Padrão: 600x600 com qualidade 0.75 ≈ 40–80KB em JPEG.
 *
 * @param {File} file Arquivo de imagem do <input type="file">
 * @param {Object} opts
 * @param {number} opts.maxLado Tamanho máximo (em px) do maior lado da imagem (default 600)
 * @param {number} opts.qualidade Qualidade JPEG 0..1 (default 0.75)
 * @returns {Promise<string>} data URL (data:image/jpeg;base64,...)
 */
export function comprimirImagem(file, opts = {}) {
  const maxLado = opts.maxLado ?? 600;
  const qualidade = opts.qualidade ?? 0.75;

  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Arquivo inválido — selecione uma imagem.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao decodificar a imagem.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxLado) {
            height = Math.round((height * maxLado) / width);
            width = maxLado;
          }
        } else {
          if (height > maxLado) {
            width = Math.round((width * maxLado) / height);
            height = maxLado;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Fundo branco pra evitar transparência preta no JPEG
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', qualidade);
        // Aviso defensivo — limite de doc do Firestore é 1MB
        const tamanhoKB = Math.round((dataUrl.length * 0.75) / 1024);
        if (tamanhoKB > 700) {
          console.warn(
            `Imagem comprimida ainda grande (${tamanhoKB}KB). ` +
              `Considere reduzir maxLado/qualidade.`
          );
        }
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
