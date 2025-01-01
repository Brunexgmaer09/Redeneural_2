#pragma once
#include "raylib.h"
#include "RedeNeural.hpp"
#include <vector>

// Função de ativação sigmoide (usando tanh)
float sigm(const float x);

// Estrutura para armazenar posições dos neurônios para renderização
struct PosicaoNeuronio {
    Vector2 posicao;
    double ativacao;
};

// Função para renderizar a rede neural
void desenharRedeNeural(const RedeNeural& rede, Rectangle area, const std::vector<double>& entradas);

// Função para interpolar cores
Color interpolarCor(Color cor1, Color cor2, float fator);

// Função para desenhar conexão entre neurônios
void desenharConexao(Vector2 inicio, Vector2 fim, float peso); 