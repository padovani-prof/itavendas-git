// Variáveis globais
let parametros = {};
let coisas = {};
let fotos = {};
let contatos = {};
let agrupamentos = [];
let secoes = {};
let infoSecoes = {};

// Função para carregar CSV
async function carregarCSV(caminhoArquivo) {
    try {
        const response = await fetch(caminhoArquivo);
        const texto = await response.text();
        return parseCSV(texto);
    } catch (erro) {
        console.error(`Erro ao carregar ${caminhoArquivo}:`, erro);
        return [];
    }
}

// Parser CSV simples
function parseCSV(texto) {
    const linhas = texto.trim().split('\n');
    if (linhas.length === 0) return [];
    
    const headers = linhas[0].split(',').map(h => h.trim());
    const dados = [];
    
    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;
        
        const valores = linha.split(',').map(v => v.trim());
        const objeto = {};
        
        headers.forEach((header, index) => {
            objeto[header] = valores[index] || '';
        });
        
        dados.push(objeto);
    }
    
    return dados;
}

// Função para formatar moeda brasileira
function formatarMoeda(valor) {
    const num = parseFloat(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return 'R$ ' + num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Função para calcular média
function calcularMedia(valores) {
    if (valores.length === 0) return 0;
    const soma = valores.reduce((acc, val) => acc + parseFloat(val || 0), 0);
    return soma / valores.length;
}

// Carregar todos os dados
async function carregarDados() {
    const dadosParametros = await carregarCSV('data/parametros.csv');
    const dadosCoisas = await carregarCSV('data/coisas.csv');
    const dadosFotos = await carregarCSV('data/fotos_coisa.csv');
    const dadosContatos = await carregarCSV('data/contatos_coisa.csv');
    const dadosAgrupamentos = await carregarCSV('data/agrupamentos_coisas.csv');
    const dadosSecoes = await carregarCSV('data/secoes.csv');
    const dadosInfoSecoes = await carregarCSV('data/infos_secao.csv');
    
    // Processar parâmetros
    dadosParametros.forEach(param => {
        parametros[param.identificador] = param.valor;
    });
    
    // Processar coisas
    dadosCoisas.forEach(coisa => {
        coisas[coisa.identificador] = coisa;
    });
    
    // Processar fotos
    dadosFotos.forEach(foto => {
        if (!fotos[foto.identificador_coisa]) {
            fotos[foto.identificador_coisa] = [];
        }
        fotos[foto.identificador_coisa].push(foto);
    });
    
    // Ordenar fotos por ordem
    Object.keys(fotos).forEach(id => {
        fotos[id].sort((a, b) => parseInt(a.ordem) - parseInt(b.ordem));
    });
    
    // Processar contatos
    dadosContatos.forEach(contato => {
        if (!contatos[contato.identificador_coisa]) {
            contatos[contato.identificador_coisa] = [];
        }
        contatos[contato.identificador_coisa].push(contato);
    });
    
    // Processar agrupamentos
    agrupamentos = dadosAgrupamentos;
    
    // Processar seções
    dadosSecoes.forEach(secao => {
        secoes[secao.identificador] = secao;
    });
    
    // Processar informações de seções
    dadosInfoSecoes.forEach(info => {
        if (!infoSecoes[info.identificador_secao]) {
            infoSecoes[info.identificador_secao] = [];
        }
        infoSecoes[info.identificador_secao].push(info);
    });
    
    // Ordenar informações por ordem
    Object.keys(infoSecoes).forEach(id => {
        infoSecoes[id].sort((a, b) => parseInt(a.ordem) - parseInt(b.ordem));
    });
}

// Carregar página
async function carregarPagina(tipo) {
    await carregarDados();
    
    // Preencher informações do header
    document.getElementById('nomeSite').innerHTML = parametros.NOMESITE || 'Carregando...';
    document.getElementById('telefones').textContent = parametros.TELEFONES || '';
    
    const linkFacebook = document.getElementById('linkFacebook');
    const linkInstagram = document.getElementById('linkInstagram');
    const linkWhatsapp = document.getElementById('linkWhatsapp');
    
    if (parametros.FACEBOOK) {
        linkFacebook.href = parametros.FACEBOOK;
    } else {
        linkFacebook.style.display = 'none';
    }
    
    if (parametros.INSTAGRAM) {
        linkInstagram.href = parametros.INSTAGRAM;
    } else {
        linkInstagram.style.display = 'none';
    }
    
    if (parametros.WHATSAPP) {
        linkWhatsapp.href = `https://wa.me/${parametros.WHATSAPP}`;
    } else {
        linkWhatsapp.style.display = 'none';
    }
    
    if (tipo === 'index') {
        carregarPaginaIndex();
    } else if (tipo === 'item') {
        carregarPaginaItem();
    }
}

// Carregar página de índice (todos os produtos)
function carregarPaginaIndex() {
    const grid = document.getElementById('produtoGrid');
    grid.innerHTML = '';
    
    let temProdutos = false;
    
    Object.keys(coisas).forEach(id => {
        const coisa = coisas[id];
        const qtdInicial = parseInt(coisa.quantidade_inicial);
        const qtdVendida = parseInt(coisa.quantidade_vendida);
        
        // Mostrar apenas produtos disponíveis
        if (qtdVendida >= qtdInicial) return;
        
        temProdutos = true;
        
        // Buscar primeira foto
        const fotosCoisa = fotos[id] || [];
        const primeiraFoto = fotosCoisa.length > 0 ? fotosCoisa[0] : null;
        const caminhoFoto = primeiraFoto ? `${coisa.pasta_imagens}/${primeiraFoto.nome_arquivo}` : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';
        
        // Calcular cotações NOVO e USADO
        let cotacaoNovo = null;
        let cotacaoUsado = null;
        
        // Encontrar seções de NOVO
        Object.keys(secoes).forEach(secaoId => {
            if (secoes[secaoId].tipo === 'NOVO') {
                const infos = infoSecoes[secaoId] || [];
                const valoresNovo = infos
                    .filter(info => info.identificador_coisa === id)
                    .map(info => parseFloat(info.texto) || 0);
                
                if (valoresNovo.length > 0) {
                    const media = calcularMedia(valoresNovo);
                    cotacaoNovo = media;
                }
            }
        });
        
        // Encontrar seções de USADO
        Object.keys(secoes).forEach(secaoId => {
            if (secoes[secaoId].tipo === 'USADO') {
                const infos = infoSecoes[secaoId] || [];
                const valoresUsado = infos
                    .filter(info => info.identificador_coisa === id)
                    .map(info => parseFloat(info.texto) || 0);
                
                if (valoresUsado.length > 0) {
                    const media = calcularMedia(valoresUsado);
                    cotacaoUsado = media;
                }
            }
        });
        
        let cotacaoHTML = '';
        if (cotacaoNovo !== null || cotacaoUsado !== null) {
            cotacaoHTML = '<div class="produto-card-cotacao">';
            if (cotacaoNovo !== null) {
                cotacaoHTML += `Novo: ${formatarMoeda(cotacaoNovo)}<br>`;
            } else {
                cotacaoHTML += 'Novo: não cotado<br>';
            }
            if (cotacaoUsado !== null) {
                cotacaoHTML += `Usado: ${formatarMoeda(cotacaoUsado)}`;
            } else {
                cotacaoHTML += 'Usado: não cotado';
            }
            cotacaoHTML += '</div>';
        }
        
        // Calcular desconto máximo em combos
        let descontoMaximo = 0;
        agrupamentos.forEach(grupo => {
            if (grupo.identificador_coisa_1 === id || grupo.identificador_coisa_2 === id) {
                descontoMaximo = Math.max(descontoMaximo, parseFloat(grupo.desconto) || 0);
            }
        });
        
        let comboHTML = '';
        if (descontoMaximo > 0) {
            const outraCoisa = agrupamentos.find(g => 
                (g.identificador_coisa_1 === id || g.identificador_coisa_2 === id) && 
                parseFloat(g.desconto) === descontoMaximo
            );
            
            if (outraCoisa) {
                const idOutra = outraCoisa.identificador_coisa_1 === id ? outraCoisa.identificador_coisa_2 : outraCoisa.identificador_coisa_1;
                const nomeOutra = coisas[idOutra]?.nome_curto || '';
                comboHTML = `<div class="produto-card-combo">Ganhe até ${formatarMoeda(descontoMaximo)} comprando junto com ${nomeOutra}</div>`;
            }
        }
        
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <div class="produto-card-image-container">
                <img src="${caminhoFoto}" alt="${coisa.titulo}" class="produto-card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
                ${cotacaoHTML}
            </div>
            <div class="produto-card-body">
                <div class="produto-card-nome">${coisa.nome_curto}</div>
                <div class="produto-card-titulo">${coisa.titulo}</div>
                <div class="produto-card-preco">${formatarMoeda(coisa.preco_unitario)}</div>
                ${comboHTML}
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `item.html?id=${id}`;
        });
        
        grid.appendChild(card);
    });
    
    if (!temProdutos) {
        grid.innerHTML = '<div class="vazio"><div class="vazio-titulo">Nenhum produto disponível</div></div>';
    }
}

// Carregar página de item (detalhes do produto)
function carregarPaginaItem() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id || !coisas[id]) {
        document.getElementById('produtoDetalhes').innerHTML = '<div class="vazio"><div class="vazio-titulo">Produto não encontrado</div></div>';
        return;
    }
    
    const coisa = coisas[id];
    const fotosCoisa = fotos[id] || [];
    const contatosCoisa = contatos[id] || [];
    const qtdInicial = parseInt(coisa.quantidade_inicial);
    const qtdVendida = parseInt(coisa.quantidade_vendida);
    const qtdRestante = qtdInicial - qtdVendida;
    
    let html = '';
    
    // Carrossel de imagens
    if (fotosCoisa.length > 0) {
        html += '<div class="carrossel-container">';
        html += '<div class="carrossel">';
        
        fotosCoisa.forEach((foto, index) => {
            const ativa = index === 0 ? 'ativa' : '';
            const legenda = foto.legenda ? foto.legenda : '';
            html += `<img src="${coisa.pasta_imagens}/${foto.nome_arquivo}" alt="Foto ${index + 1}" class="carrossel-imagem ${ativa}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">`;
        });
        
        if (fotosCoisa.length > 1) {
            html += '<button class="carrossel-nav prev" onclick="mudarSlide(-1)">❮</button>';
            html += '<button class="carrossel-nav next" onclick="mudarSlide(1)">❯</button>';
            
            html += '<div class="carrossel-dots">';
            fotosCoisa.forEach((_, index) => {
                const ativa = index === 0 ? 'ativo' : '';
                html += `<div class="dot ${ativa}" onclick="irParaSlide(${index})"></div>`;
            });
            html += '</div>';
        }
        
        // Adicionar legenda se existir
        if (fotosCoisa[0].legenda) {
            html += `<div class="carrossel-legenda">${fotosCoisa[0].legenda}</div>`;
        }
        
        html += '</div>';
        html += '</div>';
    }
    
    // Título e subtítulo
    html += `<h1 class="produto-titulo">${coisa.titulo}</h1>`;
    html += `<p class="produto-subtitulo">${coisa.subtitulo}</p>`;
    
    // Preço e quantidade
    html += '<div class="produto-preco-info">';
    html += '<div class="preco-item">';
    html += `<div class="preco-valor">${formatarMoeda(coisa.preco_unitario)}</div>`;
    html += `<div class="preco-detalhes">Quantidade: ${qtdInicial} | Restam apenas ${qtdRestante}</div>`;
    
    if (qtdVendida === 0 && parseFloat(coisa.desconto_todas_unidades) > 0) {
        html += `<div class="desconto-info">Desconto se comprar todas: ${formatarMoeda(coisa.desconto_todas_unidades)} (R$ ${formatarMoeda(parseFloat(coisa.preco_unitario) - parseFloat(coisa.desconto_todas_unidades) / qtdInicial)} cada)</div>`;
    }
    
    html += '</div>';
    html += '</div>';
    
    // Descrição
    if (coisa.descricao_detalhada) {
        html += `<div class="produto-descricao">${coisa.descricao_detalhada}</div>`;
    }
    
    // Seções
    if (Object.keys(secoes).length > 0) {
        html += '<div class="secoes-container">';
        
        const secoesOrdenadas = Object.values(secoes).sort((a, b) => parseInt(a.ordem) - parseInt(b.ordem));
        
        secoesOrdenadas.forEach(secao => {
            const infos = infoSecoes[secao.identificador] || [];
            const infosCoisa = infos.filter(info => info.identificador_coisa === id);
            
            if (infosCoisa.length === 0) return;
            
            html += '<div class="secao">';
            html += `<div class="secao-titulo">${secao.tipo}</div>`;
            
            infosCoisa.forEach(info => {
                html += '<div class="secao-info">';
                html += '<div class="secao-info-esquerda">';
                
                if (secao.tipo === 'OUTRO') {
                    // OUTRO: mostrar texto clicável se houver URL, seguido de informação complementar
                    if (info.link) {
                        html += `<a href="${info.link}" target="_blank" class="secao-link">${info.texto}</a>`;
                    } else {
                        html += `<span>${info.texto}</span>`;
                    }
                    
                    if (info.informacao_complementar) {
                        html += `<span class="secao-separador">;</span> <span>${info.informacao_complementar}</span>`;
                    }
                } else if (secao.tipo === 'NOVO' || secao.tipo === 'USADO') {
                    // NOVO/USADO: mostrar valor monetário, separador, e complementar ou link
                    html += `<span class="secao-link">${formatarMoeda(info.texto)}</span>`;
                    html += '<span class="secao-separador">:</span>';
                    
                    if (info.informacao_complementar) {
                        if (info.link) {
                            html += ` <a href="${info.link}" target="_blank" class="secao-link">${info.informacao_complementar}</a>`;
                        } else {
                            html += ` <span>${info.informacao_complementar}</span>`;
                        }
                    } else if (info.link) {
                        html += ` <a href="${info.link}" target="_blank" class="secao-link">${info.link}</a>`;
                    }
                }
                
                html += '</div>';
                html += '</div>';
            });
            
            // Calcular média para NOVO/USADO
            if (secao.tipo === 'NOVO' || secao.tipo === 'USADO') {
                const valores = infosCoisa.map(info => parseFloat(info.texto) || 0);
                if (valores.length > 0) {
                    const media = calcularMedia(valores);
                    html += '<div class="secao-info">';
                    html += '<div class="secao-info-esquerda"><strong>Média:</strong></div>';
                    html += `<div class="secao-info-direita"><strong>${formatarMoeda(media)}</strong></div>`;
                    html += '</div>';
                }
            }
            
            html += '</div>';
        });
        
        html += '</div>';
    }
    
    // Contatos
    if (contatosCoisa.length > 0) {
        html += '<div class="contatos-container">';
        html += '<div class="contatos-titulo">Contato do Vendedor</div>';
        
        contatosCoisa.forEach(contato => {
            html += '<div class="contato-item">';
            if (contato.link) {
                html += `<a href="${contato.link}" target="_blank" class="contato-link">${contato.texto}</a>`;
            } else {
                html += `<span>${contato.texto}</span>`;
            }
            html += '</div>';
        });
        
        html += '</div>';
    }
    
    // Coisas relacionadas
    const coisasRelacionadas = [];
    agrupamentos.forEach(grupo => {
        if (grupo.identificador_coisa_1 === id) {
            coisasRelacionadas.push(grupo.identificador_coisa_2);
        } else if (grupo.identificador_coisa_2 === id) {
            coisasRelacionadas.push(grupo.identificador_coisa_1);
        }
    });
    
    const coisasRelacionadasUnicas = [...new Set(coisasRelacionadas)];
    
    if (coisasRelacionadasUnicas.length > 0) {
        html += '<div class="relacionadas-container">';
        html += '<div class="relacionadas-titulo">Coisas Relacionadas</div>';
        html += '<div class="relacionadas-lista">';
        
        coisasRelacionadasUnicas.forEach((idRelacionada, index) => {
            const coisaRelacionada = coisas[idRelacionada];
            if (!coisaRelacionada) return;
            
            if (index > 0) html += '<span class="relacionada-separador">,</span> ';
            
            html += '<span class="relacionada-item">';
            html += `<a href="item.html?id=${idRelacionada}" class="relacionada-link">${coisaRelacionada.nome_curto}</a>`;
            html += `<span class="relacionada-valor">(${formatarMoeda(coisaRelacionada.preco_unitario)})</span>`;
            html += '</span>';
        });
        
        html += '</div>';
        html += '</div>';
    }
    
    // Combos
    const combos = [];
    const gruposCoisa = agrupamentos.filter(g => g.identificador_coisa_1 === id || g.identificador_coisa_2 === id);
    
    gruposCoisa.forEach(grupo => {
        const idOutra = grupo.identificador_coisa_1 === id ? grupo.identificador_coisa_2 : grupo.identificador_coisa_1;
        
        // Verificar se há desconto neste grupo
        if (parseFloat(grupo.desconto) > 0) {
            // Verificar se outras coisas do mesmo agrupamento também têm desconto
            const gruposRelacionados = agrupamentos.filter(g => 
                (g.identificador_coisa_1 === idOutra || g.identificador_coisa_2 === idOutra) &&
                (g.identificador_coisa_1 === id || g.identificador_coisa_2 === id)
            );
            
            const somaDescontos = gruposRelacionados.reduce((sum, g) => sum + (parseFloat(g.desconto) || 0), 0);
            
            if (somaDescontos > 0) {
                combos.push({
                    idOutra,
                    desconto: somaDescontos
                });
            }
        }
    });
    
    const combosUnicos = [...new Map(combos.map(c => [c.idOutra, c])).values()];
    
    if (combosUnicos.length > 0) {
        html += '<div class="combos-container">';
        html += '<div class="combos-titulo">Pacotes (Combos)</div>';
        
        combosUnicos.forEach(combo => {
            const coisaCombo = coisas[combo.idOutra];
            if (!coisaCombo) return;
            
            const precoCoisa = parseFloat(coisa.preco_unitario);
            const precoCombo = parseFloat(coisaCombo.preco_unitario);
            const somaPrecos = precoCoisa + precoCombo;
            const somaDescontos = combo.desconto;
            const precoFinal = somaPrecos - somaDescontos;
            
            html += '<div class="combo-item">';
            
            if (somaDescontos > 0) {
                html += `<span class="combo-preco-original">De ${formatarMoeda(somaPrecos)}</span> por apenas `;
                html += `<span class="combo-preco-desconto">${formatarMoeda(precoFinal)}</span>`;
            } else {
                html += `Por apenas <span class="combo-preco-desconto">${formatarMoeda(somaPrecos)}</span>`;
            }
            
            html += ': ';
            html += `<span class="combo-item-nome">${coisa.nome_curto}</span>`;
            html += `<span class="combo-item-preco">(${formatarMoeda(precoCoisa)})</span>`;
            html += ' <span class="combo-separador">+</span> ';
            html += `<span class="combo-item-nome"><a href="item.html?id=${combo.idOutra}" class="combo-item-nome-link">${coisaCombo.nome_curto}</a></span>`;
            html += `<span class="combo-item-preco">(${formatarMoeda(precoCombo)})</span>`;
            
            html += '</div>';
        });
        
        html += '</div>';
    }
    
    // Botão WhatsApp
    html += '<div class="whatsapp-container">';
    const textoWhats = parametros.TEXTOWHATS || '';
    const numeroWhats = parametros.WHATSAPP || '';
    const textoFinal = `${textoWhats} ${id}`;
    const linkWhats = `https://api.whatsapp.com/send/?phone=${numeroWhats}&text=${encodeURIComponent(textoFinal)}&type=phone_number&app_absent=0`;
    html += `<a href="${linkWhats}" target="_blank" class="whatsapp-link">Falar com o vendedor</a>`;
    html += '</div>';
    
    // Voltar para índice
    html += '<div class="voltar-index-container">';
    html += '<a href="index.html" class="voltar-index-link">← Voltar para todos os produtos</a>';
    html += '</div>';
    
    document.getElementById('produtoDetalhes').innerHTML = html;
    
    // Inicializar carrossel se houver fotos
    if (fotosCoisa.length > 1) {
        window.currentSlide = 0;
    }
}

// Funções de controle do carrossel
let currentSlide = 0;

function mudarSlide(direcao) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const fotosCoisa = fotos[id] || [];
    
    currentSlide += direcao;
    if (currentSlide < 0) {
        currentSlide = fotosCoisa.length - 1;
    } else if (currentSlide >= fotosCoisa.length) {
        currentSlide = 0;
    }
    
    atualizarCarrossel(id);
}

function irParaSlide(index) {
    currentSlide = index;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    atualizarCarrossel(id);
}

function atualizarCarrossel(id) {
    const imagens = document.querySelectorAll('.carrossel-imagem');
    const dots = document.querySelectorAll('.dot');
    const legenda = document.querySelector('.carrossel-legenda');
    const fotosCoisa = fotos[id] || [];
    
    imagens.forEach((img, index) => {
        img.classList.remove('ativa');
        if (index === currentSlide) {
            img.classList.add('ativa');
        }
    });
    
    dots.forEach((dot, index) => {
        dot.classList.remove('ativo');
        if (index === currentSlide) {
            dot.classList.add('ativo');
        }
    });
    
    if (legenda && fotosCoisa[currentSlide]) {
        legenda.textContent = fotosCoisa[currentSlide].legenda || '';
    }
}
