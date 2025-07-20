/**
 * Classe para processamento de entradas da rede neural
 * Convertido do C++
 */

class InputsRedeNeural {
    /**
     * Processa e normaliza dados de entrada para a rede neural
     * @param {Array<number>} dadosEntrada - Dados brutos de entrada
     * @returns {Array<number>} - Dados processados e normalizados
     */
    static processarEntradas(dadosEntrada) {
        const entradas = [];
        
        // Processa cada entrada (pode adicionar normalização ou outros pré-processamentos)
        for (const dado of dadosEntrada) {
            entradas.push(dado);
        }
        
        return entradas;
    }
    
    /**
     * Normaliza valores para o range [-1, 1]
     * @param {number} valor - Valor a ser normalizado
     * @param {number} min - Valor mínimo do range original
     * @param {number} max - Valor máximo do range original
     * @returns {number} - Valor normalizado entre -1 e 1
     */
    static normalizar(valor, min, max) {
        return ((valor - min) / (max - min)) * 2 - 1;
    }
    
    /**
     * Desnormaliza valores do range [-1, 1] para o range original
     * @param {number} valorNormalizado - Valor normalizado entre -1 e 1
     * @param {number} min - Valor mínimo do range de destino
     * @param {number} max - Valor máximo do range de destino
     * @returns {number} - Valor desnormalizado
     */
    static desnormalizar(valorNormalizado, min, max) {
        return ((valorNormalizado + 1) / 2) * (max - min) + min;
    }
    
    /**
     * Processa entradas para um jogo estilo Flappy Bird
     * @param {Object} dadosJogo - Objeto com dados do jogo
     * @returns {Array<number>} - Array com 5 entradas normalizadas
     */
    static processarEntradasFlappyBird(dadosJogo) {
        const {
            jogadorY,           // Posição Y do jogador
            jogadorVelocidadeY, // Velocidade Y do jogador
            proximoCanoX,       // Posição X do próximo cano
            proximoCanoAlturaAbertura, // Altura da abertura do cano
            distanciaProximoCano // Distância até o próximo cano
        } = dadosJogo;
        
        // Normalizar entradas (assumindo valores típicos para Flappy Bird)
        const entradas = [
            this.normalizar(jogadorY, 0, 600),                    // Posição Y (0-600 pixels)
            this.normalizar(jogadorVelocidadeY, -15, 15),         // Velocidade Y (-15 a +15)
            this.normalizar(proximoCanoX, 0, 800),                // Posição X do cano (0-800 pixels)
            this.normalizar(proximoCanoAlturaAbertura, 0, 600),   // Altura da abertura (0-600 pixels)
            this.normalizar(distanciaProximoCano, 0, 800)         // Distância até cano (0-800 pixels)
        ];
        
        return entradas;
    }
    
    /**
     * Processa entradas para um jogo de corrida/esquiva
     * @param {Object} dadosJogo - Objeto com dados do jogo
     * @returns {Array<number>} - Array com entradas normalizadas
     */
    static processarEntradasCorrida(dadosJogo) {
        const {
            jogadorX,
            jogadorY,
            obstaculoProximoX,
            obstaculoProximoY,
            velocidadeJogo,
            larguraTela = 800,
            alturaTela = 600
        } = dadosJogo;
        
        const entradas = [
            this.normalizar(jogadorX, 0, larguraTela),
            this.normalizar(jogadorY, 0, alturaTela),
            this.normalizar(obstaculoProximoX, 0, larguraTela),
            this.normalizar(obstaculoProximoY, 0, alturaTela),
            this.normalizar(velocidadeJogo, 0, 20)
        ];
        
        return entradas;
    }
    
    /**
     * Processa entradas genéricas com normalização automática
     * @param {Array<number>} dados - Dados brutos
     * @param {Array<{min: number, max: number}>} ranges - Ranges para cada entrada
     * @returns {Array<number>} - Dados normalizados
     */
    static processarEntradasGenericas(dados, ranges) {
        if (dados.length !== ranges.length) {
            throw new Error("Quantidade de dados deve ser igual à quantidade de ranges");
        }
        
        const entradas = [];
        for (let i = 0; i < dados.length; i++) {
            const valorNormalizado = this.normalizar(dados[i], ranges[i].min, ranges[i].max);
            entradas.push(valorNormalizado);
        }
        
        return entradas;
    }
    
    /**
     * Clamp: limita um valor entre min e max
     * @param {number} valor - Valor a ser limitado
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} - Valor limitado
     */
    static clamp(valor, min, max) {
        return Math.min(Math.max(valor, min), max);
    }
    
    /**
     * Interpola linearmente entre dois valores
     * @param {number} a - Valor inicial
     * @param {number} b - Valor final
     * @param {number} t - Fator de interpolação (0-1)
     * @returns {number} - Valor interpolado
     */
    static lerp(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    }
}

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InputsRedeNeural };
}