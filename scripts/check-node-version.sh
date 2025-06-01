#!/bin/bash

# Verifica se o arquivo .nvmrc existe
if [ ! -f ".nvmrc" ]; then
    echo "Arquivo .nvmrc não encontrado!"
    exit 1
fi

# Lê a versão do Node.js do arquivo .nvmrc
NODE_VERSION=$(cat .nvmrc)

# Verifica se o nvm está instalado
if ! command -v nvm &> /dev/null; then
    echo "nvm não encontrado. Instalando..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Verifica se a versão necessária está instalada
if ! nvm ls $NODE_VERSION &> /dev/null; then
    echo "Node.js $NODE_VERSION não encontrado. Instalando..."
    nvm install $NODE_VERSION
fi

# Usa a versão correta
nvm use $NODE_VERSION
