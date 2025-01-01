#include "utils.hpp"
#include <cmath>
#include <vector>

float sigm(const float x) {
    return std::tanh(x);
}

Color interpolarCor(Color cor1, Color cor2, float fator) {
    return {
        (unsigned char)(cor1.r + (cor2.r - cor1.r) * fator),
        (unsigned char)(cor1.g + (cor2.g - cor1.g) * fator),
        (unsigned char)(cor1.b + (cor2.b - cor1.b) * fator),
        255
    };
}

void desenharConexao(Vector2 inicio, Vector2 fim, float peso) {
    // Cor baseada no peso (azul para positivo, vermelho para negativo)
    Color cor = peso > 0 ? BLUE : RED;
    float intensidade = std::min(std::abs(peso), 1.0f);
    cor = ColorAlpha(cor, intensidade * 0.7f);
    
    // Espessura baseada no peso
    float espessura = std::max(1.0f, std::abs(peso) * 2.0f);
    
    DrawLineEx(inicio, fim, espessura, cor);
}

void desenharRedeNeural(const RedeNeural& rede, Rectangle area, const std::vector<double>& entradas) {
    const float raioNeuronio = 12.0f;
    const float espacamentoVertical = 35.0f;
    const float espacamentoHorizontal = 60.0f;
    
    // Cores dos neurônios
    const Color corInativa = SKYBLUE;
    const Color corAtiva = BLUE;
    
    // Calcula posições dos neurônios
    std::vector<std::vector<PosicaoNeuronio>> camadas;
    
    // Camada de entrada
    camadas.push_back(std::vector<PosicaoNeuronio>(entradas.size()));
    float y = area.y + raioNeuronio;
    for(size_t i = 0; i < entradas.size(); i++) {
        camadas.back()[i].posicao = {
            area.x + raioNeuronio,
            y + i * espacamentoVertical
        };
        camadas.back()[i].ativacao = entradas[i];
    }
    
    // Camadas escondidas
    const auto& camadasEscondidas = rede.getCamadasEscondidas();
    for(size_t c = 0; c < camadasEscondidas.size(); c++) {
        const auto& camada = camadasEscondidas[c];
        camadas.push_back(std::vector<PosicaoNeuronio>(camada.getQuantidadeNeuronios()));
        
        y = area.y + raioNeuronio;
        for(int i = 0; i < camada.getQuantidadeNeuronios(); i++) {
            camadas.back()[i].posicao = {
                area.x + raioNeuronio + (c + 1) * espacamentoHorizontal,
                y + i * espacamentoVertical
            };
            camadas.back()[i].ativacao = camada.getNeuronio(i).getSaida();
        }
    }
    
    // Camada de saída
    const auto& camadaSaida = rede.getCamadaSaida();
    camadas.push_back(std::vector<PosicaoNeuronio>(camadaSaida.getQuantidadeNeuronios()));
    y = area.y + raioNeuronio;
    for(int i = 0; i < camadaSaida.getQuantidadeNeuronios(); i++) {
        camadas.back()[i].posicao = {
            area.x + raioNeuronio + (camadasEscondidas.size() + 1) * espacamentoHorizontal,
            y + i * espacamentoVertical
        };
        camadas.back()[i].ativacao = camadaSaida.getNeuronio(i).getSaida();
    }
    
    // Desenha conexões
    for(size_t i = 1; i < camadas.size(); i++) {
        for(size_t j = 0; j < camadas[i].size(); j++) {
            for(size_t k = 0; k < camadas[i-1].size(); k++) {
                float peso = 1.0f;
                if(i == 1) { // Conexões da entrada para primeira camada escondida
                    peso = rede.getCamadasEscondidas()[0].getNeuronio(j).getPeso(k);
                }
                else if(i == camadas.size() - 1) { // Conexões para camada de saída
                    peso = rede.getCamadaSaida().getNeuronio(j).getPeso(k);
                }
                else { // Conexões entre camadas escondidas
                    peso = rede.getCamadasEscondidas()[i-1].getNeuronio(j).getPeso(k);
                }
                
                desenharConexao(
                    camadas[i-1][k].posicao,
                    camadas[i][j].posicao,
                    peso
                );
            }
        }
    }
    
    // Desenha neurônios
    for(const auto& camada : camadas) {
        for(const auto& neuronio : camada) {
            // Interpola entre azul claro e azul escuro baseado na ativação
            Color cor = interpolarCor(corInativa, corAtiva, 
                std::abs(neuronio.ativacao));
            
            // Desenha borda branca
            DrawCircle(neuronio.posicao.x, neuronio.posicao.y, 
                      raioNeuronio + 2, WHITE);
            // Desenha neurônio
            DrawCircle(neuronio.posicao.x, neuronio.posicao.y, 
                      raioNeuronio, cor);
            
            // Desenha valor de ativação
            char texto[10];
            sprintf(texto, "%.2f", neuronio.ativacao);
            int larguraTexto = MeasureText(texto, 10);
            DrawText(texto, 
                    neuronio.posicao.x - larguraTexto/2,
                    neuronio.posicao.y - 5,
                    10, WHITE);
        }
    }
} 