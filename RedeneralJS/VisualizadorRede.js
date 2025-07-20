/**
 * Visualizador de Rede Neural para Canvas (JavaScript)
 * Convertido das funcionalidades de utils.cpp (Raylib) para Canvas HTML5
 */

class VisualizadorRede {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configurações visuais
        this.raioNeuronio = 12;
        this.espacamentoVertical = 35;
        this.espacamentoHorizontal = 80;
        
        // Cores
        this.corInativa = '#87CEEB';  // SkyBlue
        this.corAtiva = '#0000FF';    // Blue
        this.corConexaoPositiva = '#0000FF';  // Blue
        this.corConexaoNegativa = '#FF0000';  // Red
        this.corTexto = '#FFFFFF';    // White
        this.corBorda = '#FFFFFF';    // White
    }
    
    /**
     * Função sigmoide usando tanh (como no C++)
     * @param {number} x - Valor de entrada
     * @returns {number} - Valor processado
     */
    static sigm(x) {
        return Math.tanh(x);
    }
    
    /**
     * Interpola entre duas cores
     * @param {string} cor1 - Cor inicial (hex)
     * @param {string} cor2 - Cor final (hex)
     * @param {number} fator - Fator de interpolação (0-1)
     * @returns {string} - Cor interpolada
     */
    interpolarCor(cor1, cor2, fator) {
        const hex1 = cor1.replace('#', '');
        const hex2 = cor2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * fator);
        const g = Math.round(g1 + (g2 - g1) * fator);
        const b = Math.round(b1 + (b2 - b1) * fator);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Desenha uma conexão entre dois neurônios
     * @param {Object} inicio - Posição inicial {x, y}
     * @param {Object} fim - Posição final {x, y}
     * @param {number} peso - Peso da conexão
     */
    desenharConexao(inicio, fim, peso) {
        const ctx = this.ctx;
        
        // Cor baseada no peso (azul para positivo, vermelho para negativo)
        const cor = peso > 0 ? this.corConexaoPositiva : this.corConexaoNegativa;
        const intensidade = Math.min(Math.abs(peso), 1.0);
        
        // Espessura baseada no peso
        const espessura = Math.max(1, Math.abs(peso) * 3);
        
        ctx.beginPath();
        ctx.moveTo(inicio.x, inicio.y);
        ctx.lineTo(fim.x, fim.y);
        ctx.strokeStyle = cor;
        ctx.globalAlpha = intensidade * 0.7;
        ctx.lineWidth = espessura;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Desenha a rede neural completa
     * @param {RedeNeural} rede - Instância da rede neural
     * @param {Array<number>} entradas - Valores de entrada
     * @param {Object} area - Área de desenho {x, y, width, height}
     */
    desenharRedeNeural(rede, entradas, area = null) {
        if (!area) {
            area = { x: 20, y: 20, width: this.canvas.width - 40, height: this.canvas.height - 40 };
        }
        
        // Limpar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calcular posições dos neurônios
        const camadas = this.calcularPosicoesNeuronios(rede, entradas, area);
        
        // Desenhar conexões primeiro (para ficarem atrás dos neurônios)
        this.desenharConexoes(rede, camadas);
        
        // Desenhar neurônios
        this.desenharNeuronios(camadas);
        
        // Desenhar informações adicionais
        this.desenharInformacoes(rede, area);
    }
    
    /**
     * Calcula as posições de todos os neurônios
     */
    calcularPosicoesNeuronios(rede, entradas, area) {
        const camadas = [];
        let x = area.x + this.raioNeuronio * 2;
        
        // Camada de entrada
        const camadaEntrada = [];
        let y = area.y + this.raioNeuronio * 2;
        for (let i = 0; i < entradas.length; i++) {
            camadaEntrada.push({
                posicao: { x: x, y: y + i * this.espacamentoVertical },
                ativacao: entradas[i]
            });
        }
        camadas.push(camadaEntrada);
        x += this.espacamentoHorizontal;
        
        // Camadas escondidas
        const camadasEscondidas = rede.getCamadasEscondidas();
        for (let c = 0; c < camadasEscondidas.length; c++) {
            const camada = camadasEscondidas[c];
            const camadaAtual = [];
            y = area.y + this.raioNeuronio * 2;
            
            for (let i = 0; i < camada.getQuantidadeNeuronios(); i++) {
                camadaAtual.push({
                    posicao: { x: x, y: y + i * this.espacamentoVertical },
                    ativacao: camada.getNeuronio(i).getSaida()
                });
            }
            camadas.push(camadaAtual);
            x += this.espacamentoHorizontal;
        }
        
        // Camada de saída
        const camadaSaida = rede.getCamadaSaida();
        const camadaSaidaPos = [];
        y = area.y + this.raioNeuronio * 2;
        
        for (let i = 0; i < camadaSaida.getQuantidadeNeuronios(); i++) {
            camadaSaidaPos.push({
                posicao: { x: x, y: y + i * this.espacamentoVertical },
                ativacao: camadaSaida.getNeuronio(i).getSaida()
            });
        }
        camadas.push(camadaSaidaPos);
        
        return camadas;
    }
    
    /**
     * Desenha todas as conexões entre neurônios
     */
    desenharConexoes(rede, camadas) {
        for (let i = 1; i < camadas.length; i++) {
            for (let j = 0; j < camadas[i].length; j++) {
                for (let k = 0; k < camadas[i-1].length; k++) {
                    let peso = 1.0;
                    
                    if (i === 1) { // Conexões da entrada para primeira camada escondida
                        peso = rede.getCamadasEscondidas()[0].getNeuronio(j).getPeso(k);
                    } else if (i === camadas.length - 1) { // Conexões para camada de saída
                        peso = rede.getCamadaSaida().getNeuronio(j).getPeso(k);
                    } else { // Conexões entre camadas escondidas
                        peso = rede.getCamadasEscondidas()[i-1].getNeuronio(j).getPeso(k);
                    }
                    
                    this.desenharConexao(
                        camadas[i-1][k].posicao,
                        camadas[i][j].posicao,
                        peso
                    );
                }
            }
        }
    }
    
    /**
     * Desenha todos os neurônios
     */
    desenharNeuronios(camadas) {
        const ctx = this.ctx;
        
        for (const camada of camadas) {
            for (const neuronio of camada) {
                // Interpola cor baseada na ativação
                const intensidade = Math.abs(neuronio.ativacao);
                const cor = this.interpolarCor(this.corInativa, this.corAtiva, intensidade);
                
                // Desenha borda branca
                ctx.beginPath();
                ctx.arc(neuronio.posicao.x, neuronio.posicao.y, this.raioNeuronio + 2, 0, 2 * Math.PI);
                ctx.fillStyle = this.corBorda;
                ctx.fill();
                
                // Desenha neurônio
                ctx.beginPath();
                ctx.arc(neuronio.posicao.x, neuronio.posicao.y, this.raioNeuronio, 0, 2 * Math.PI);
                ctx.fillStyle = cor;
                ctx.fill();
                
                // Desenha valor de ativação
                const texto = neuronio.ativacao.toFixed(2);
                ctx.font = '10px Arial';
                ctx.fillStyle = this.corTexto;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(texto, neuronio.posicao.x, neuronio.posicao.y);
            }
        }
    }
    
    /**
     * Desenha informações adicionais sobre a rede
     */
    desenharInformacoes(rede, area) {
        const ctx = this.ctx;
        const info = [
            `Entradas: ${rede.getCamadaEntrada().getQuantidadeNeuronios()}`,
            `Escondidas: ${rede.getCamadasEscondidas().length} camadas`,
            `Saídas: ${rede.getCamadaSaida().getQuantidadeNeuronios()}`,
            `Total Pesos: ${rede.getQuantidadePesos()}`
        ];
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < info.length; i++) {
            ctx.fillText(info[i], area.x, area.y + area.height + 20 + i * 15);
        }
    }
    
    /**
     * Atualiza a visualização com novos dados
     * @param {RedeNeural} rede - Rede neural
     * @param {Array<number>} entradas - Novas entradas
     */
    atualizar(rede, entradas) {
        rede.copiarParaEntrada(entradas);
        rede.calcularSaida();
        this.desenharRedeNeural(rede, entradas);
    }
    
    /**
     * Redimensiona o canvas
     * @param {number} width - Nova largura
     * @param {number} height - Nova altura
     */
    redimensionar(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

// Para uso em Node.js (sem canvas)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VisualizadorRede };
}