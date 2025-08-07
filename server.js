const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS
app.use(cors());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal - serve o HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cache para evitar muitas requisições
let queueCache = {
    count: 0,
    lastUpdate: 0
};
const CACHE_DURATION = 30000; // 30 segundos - sincronizado com o frontend

// Função para obter o número de pessoas na fila
async function getQueueCount() {
    const now = Date.now();
    
    // Força atualização a cada 30 segundos (mesmo tempo do frontend)
    if (now - queueCache.lastUpdate < CACHE_DURATION) {
        console.log('Retornando cache:', queueCache.count);
        return queueCache.count;
    }

    let browser = null;
    try {
        console.log('Iniciando browser...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--deterministic-fetch',
                '--disable-features=IsolateOrigins',
                '--disable-site-isolation-trials'
            ]
        });

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(30000);

        console.log('Navegando para FastGet...');
        await page.goto('https://app.fastget.com.br/#/panel/d55420f6-b1b2-11ef-9f40-029e72b0772d/QUEUE', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Aguarda a página carregar completamente
        await page.waitForTimeout(3000);

        console.log('Contando pessoas na fila...');
        const count = await page.evaluate(() => {
            const queueItems = document.querySelectorAll('div.item.font-bold');
            return queueItems.length;
        });

        console.log('Contagem obtida:', count);

        // Atualiza cache
        queueCache.count = count;
        queueCache.lastUpdate = now;

        return count;

    } catch (error) {
        console.error('Erro ao obter contagem da fila:', error);
        
        // Se temos um cache válido, usa ele
        if (queueCache.count >= 0 && (now - queueCache.lastUpdate) < 60000) {
            console.log('Usando cache devido ao erro:', queueCache.count);
            return queueCache.count;
        }
        
        // Se não tem cache válido, assume fila vazia
        console.log('Assumindo fila vazia devido ao erro');
        queueCache.count = 0;
        queueCache.lastUpdate = now;
        return 0;

    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (error) {
                console.error('Erro ao fechar browser:', error);
            }
        }
    }
}

// Endpoint para obter a contagem da fila
app.get('/api/queue-count', async (req, res) => {
    try {
        const count = await getQueueCount();
        console.log('Enviando resposta:', count);
        res.json({ count: count });
    } catch (error) {
        console.error('Erro no endpoint /api/queue-count:', error);
        res.status(500).json({ error: 'Falha ao obter contagem', count: 0 });
    }
});

// Endpoint de saúde
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        queueCount: queueCache.count
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
