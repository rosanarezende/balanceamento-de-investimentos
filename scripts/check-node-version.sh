#!/bin/bash

# Verifica se estamos em um ambiente CI
if [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ]; then
    echo "Ambiente de CI detectado, verificando a versão do Node.js..."
    
    # Verificando a versão do Node.js atual
    CURRENT_NODE_VERSION=$(node -v)
    echo "Node.js atual: $CURRENT_NODE_VERSION"
    
    # Em ambientes CI, geralmente a versão do Node.js já está correta
    # então saímos com sucesso sem fazer alterações
    exit 0
fi

# Verifica se o arquivo .nvmrc existe
if [ ! -f ".nvmrc" ]; then
    echo "Arquivo .nvmrc não encontrado!"
    exit 1
fi

# Lê a versão do Node.js do arquivo .nvmrc
NODE_VERSION=$(cat .nvmrc)

# Verifica se npm_config_prefix está definido, o que pode causar problemas com o nvm
if [ -n "$npm_config_prefix" ]; then
    echo "Desativando temporariamente npm_config_prefix para compatibilidade com nvm"
    NPM_CONFIG_PREFIX_TEMP=$npm_config_prefix
    unset npm_config_prefix
fi

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

# Restaura npm_config_prefix se foi salvo anteriormente
if [ -n "$NPM_CONFIG_PREFIX_TEMP" ]; then
    export npm_config_prefix=$NPM_CONFIG_PREFIX_TEMP
fi
