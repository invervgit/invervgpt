// ==========================================
// ULTIMATE PUTER.JS APPLICATION
// 500+ AI Models | All Features | Optimized
// ==========================================

// Global State
let currentModel = 'gpt-4o-mini'; // Fast and high-quality default
let stats = {
    totalQueries: 0,
    totalResponseTime: 0,
    totalTokens: 0
};
let lastResponse = '';
let queryHistory = [];
let selectedFile = null;

// ==========================================
// INITIALIZATION
// ==========================================
window.onload = async function() {
    console.log('✅ Puter.js Ultimate Hub loaded!');
    console.log('📊 500+ AI models available');
    console.log('🔥 Optimized for speed and quality');
    
    // Load stats from KV storage
    await loadStats();
    
    // Check auth status
    checkAuthStatus();
    
    // Setup file input handler
    document.getElementById('fileInput').addEventListener('change', handleFileSelection);
    
    // Load history
    await loadHistory();
};

// ==========================================
// AUTH MANAGEMENT
// ==========================================
function checkAuthStatus() {
    if (puter.auth.isSignedIn()) {
        puter.auth.getUser().then(user => {
            document.getElementById('authStatus').innerHTML = `
                <div class="auth-user">
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <div>
                        <div style="font-weight: bold;">${user.username}</div>
                        <button class="btn btn-secondary" style="padding: 5px 10px; margin-top: 5px;" onclick="handleAuth()">Sign Out</button>
                    </div>
                </div>
            `;
        });
    }
}

async function handleAuth() {
    if (puter.auth.isSignedIn()) {
        await puter.auth.signOut();
        document.getElementById('authStatus').innerHTML = `
            <button class="btn btn-primary" onclick="handleAuth()">Sign In to Puter</button>
        `;
    } else {
        try {
            await puter.auth.signIn();
            checkAuthStatus();
        } catch (error) {
            console.error('Auth error:', error);
        }
    }
}

// ==========================================
// NAVIGATION
// ==========================================
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.sidebar .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// ==========================================
// MODEL SELECTION
// ==========================================
function selectModel(modelName) {
    currentModel = modelName;
    document.getElementById('currentModel').textContent = modelName;
    
    // Update UI
    document.querySelectorAll('.model-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    showNotification(`✅ Model switched to: ${modelName}`);
}

function setPrompt(text) {
    document.getElementById('chatPrompt').value = text;
}

// ==========================================
// AI CHAT - STREAMING (OPTIMIZED)
// ==========================================
async function generateChat() {
    const prompt = document.getElementById('chatPrompt').value;
    if (!prompt) {
        alert('Please enter a prompt!');
        return;
    }
    
    const outputBox = document.getElementById('chatResponseBox');
    const outputContainer = document.getElementById('chatOutput');
    outputContainer.classList.add('show');
    
    outputBox.innerHTML = '<div class="loading"><div class="spinner"></div> Streaming response from ' + currentModel + '...</div>';
    
    const startTime = Date.now();
    let fullText = '';
    
    try {
        // Add system message to tell model who it is
        const messages = [
            { role: 'system', content: `You are ${currentModel}. Always provide helpful, accurate, and detailed responses.` },
            { role: 'user', content: prompt }
        ];
        
        const response = await puter.ai.chat(messages, {
            model: currentModel,
            stream: true,
            temperature: 0.7
        });
        
        outputBox.innerHTML = '';
        
        // Stream response in real-time
        for await (const part of response) {
            const text = part?.text || part?.message?.content || '';
            fullText += text;
            outputBox.innerHTML = fullText.replace(/\n/g, '<br>');
            
            // Auto-scroll
            outputBox.scrollTop = outputBox.scrollHeight;
        }
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Update stats
        updateStats(responseTime, fullText);
        
        // Store response for saving
        lastResponse = fullText;
        
        // Add to history
        addToHistory(prompt, fullText, currentModel, responseTime);
        
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

// Quick response without streaming
async function generateChatNoStream() {
    const prompt = document.getElementById('chatPrompt').value;
    if (!prompt) {
        alert('Please enter a prompt!');
        return;
    }
    
    const outputBox = document.getElementById('chatResponseBox');
    const outputContainer = document.getElementById('chatOutput');
    outputContainer.classList.add('show');
    
    outputBox.innerHTML = '<div class="loading"><div class="spinner"></div> Generating response...</div>';
    
    const startTime = Date.now();
    
    try {
        const messages = [
            { role: 'system', content: `You are ${currentModel}.` },
            { role: 'user', content: prompt }
        ];
        
        const response = await puter.ai.chat(messages, {
            model: currentModel,
            temperature: 0.7
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Extract text based on response structure
        let text = '';
        if (typeof response === 'string') {
            text = response;
        } else if (response.message?.content) {
            if (Array.isArray(response.message.content)) {
                text = response.message.content[0].text || response.message.content[0];
            } else {
                text = response.message.content;
            }
        } else {
            text = JSON.stringify(response);
        }
        
        outputBox.innerHTML = text.replace(/\n/g, '<br>');
        
        updateStats(responseTime, text);
        lastResponse = text;
        addToHistory(prompt, text, currentModel, responseTime);
        
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

// ==========================================
// IMAGE GENERATION
// ==========================================
async function generateImage() {
    const prompt = document.getElementById('imagePrompt').value;
    const model = document.getElementById('imageModel').value;
    
    if (!prompt) {
        alert('Please enter an image description!');
        return;
    }
    
    const outputBox = document.getElementById('imageResponseBox');
    const outputContainer = document.getElementById('imageOutput');
    outputContainer.classList.add('show');
    
    outputBox.innerHTML = '<div class="loading"><div class="spinner"></div> Generating image with ' + model + '...</div>';
    
    const startTime = Date.now();
    
    try {
        const imageElement = await puter.ai.txt2img(prompt, { model: model });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        outputBox.innerHTML = `<strong>Generated Image:</strong><br><small>Time: ${responseTime}ms | Model: ${model}</small><br>`;
        imageElement.classList.add('image-preview');
        outputBox.appendChild(imageElement);
        
        stats.totalQueries++;
        document.getElementById('totalQueries').textContent = stats.totalQueries;
        
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

// ==========================================
// VISION ANALYSIS
// ==========================================
async function analyzeImage() {
    const imageUrl = document.getElementById('visionUrl').value;
    const visionPrompt = document.getElementById('visionPrompt').value || "Describe this image in detail.";
    
    if (!imageUrl) {
        alert('Please enter an image URL!');
        return;
    }
    
    const outputBox = document.getElementById('visionResponseBox');
    const outputContainer = document.getElementById('visionOutput');
    outputContainer.classList.add('show');
    
    outputBox.innerHTML = '<div class="loading"><div class="spinner"></div> Analyzing image...</div>';
    
    const startTime = Date.now();
    
    try {
        // Use vision-capable model
        const visionModel = currentModel.includes('gpt') ? currentModel : 'gpt-4o-mini';
        
        const response = await puter.ai.chat(
            visionPrompt,
            imageUrl,
            { 
                model: visionModel,
                stream: true
            }
        );
        
        let fullText = `<img src="${imageUrl}" class="image-preview"><br><br><strong>Analysis:</strong><br><br>`;
        outputBox.innerHTML = fullText;
        
        for await (const part of response) {
            const text = part?.text || '';
            fullText += text;
            outputBox.innerHTML = fullText.replace(/\n/g, '<br>');
        }
        
        const endTime = Date.now();
        updateStats(endTime - startTime, fullText);
        
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

// ==========================================
// MODEL COMPARISON
// ==========================================
async function compareModels() {
    const prompt = document.getElementById('comparePrompt').value;
    if (!prompt) {
        alert('Please enter a prompt to compare!');
        return;
    }
    
    const outputContainer = document.getElementById('compareOutput');
    const comparisonGrid = document.getElementById('comparisonGrid');
    outputContainer.classList.add('show');
    comparisonGrid.innerHTML = '<div class="loading"><div class="spinner"></div> Comparing models...</div>';
    
    // Models to compare
    const modelsToCompare = [
        'gpt-4o-mini',
        'claude-sonnet-4',
        'google/gemini-2.0-flash-lite-001',
        'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
    ];
    
    comparisonGrid.innerHTML = '';
    
    const results = await Promise.all(
        modelsToCompare.map(async (model) => {
            const startTime = Date.now();
            try {
                const response = await puter.ai.chat(prompt, { model: model });
                const endTime = Date.now();
                
                let text = '';
                if (typeof response === 'string') {
                    text = response;
                } else if (response.message?.content) {
                    text = Array.isArray(response.message.content) 
                        ? response.message.content[0].text || response.message.content[0]
                        : response.message.content;
                }
                
                return {
                    model: model,
                    response: text,
                    time: endTime - startTime
                };
            } catch (error) {
                return {
                    model: model,
                    response: `Error: ${error.message}`,
                    time: 0
                };
            }
        })
    );
    
    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'comparison-card';
        card.innerHTML = `
            <div class="comparison-model">${result.model}</div>
            <div style="font-size: 0.85em; color: #666; margin-bottom: 10px;">Time: ${result.time}ms</div>
            <div style="line-height: 1.6;">${result.response.substring(0, 300)}${result.response.length > 300 ? '...' : ''}</div>
        `;
        comparisonGrid.appendChild(card);
    });
}

// ==========================================
// FUNCTION CALLING
// ==========================================
async function executeFunctionCall() {
    const prompt = document.getElementById('toolPrompt').value;
    if (!prompt) {
        alert('Please enter a prompt!');
        return;
    }
    
    const outputBox = document.getElementById('toolResponseBox');
    const outputContainer = document.getElementById('toolOutput');
    outputContainer.classList.add('show');
    
    outputBox.innerHTML = '<div class="loading"><div class="spinner"></div> Executing with tools...</div>';
    
    // Define tools
    const tools = [
        {
            type: "function",
            function: {
                name: "get_weather",
                description: "Get current weather for a location",
                parameters: {
                    type: "object",
                    properties: {
                        location: { type: "string", description: "City name" }
                    },
                    required: ["location"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "calculate",
                description: "Perform mathematical calculations",
                parameters: {
                    type: "object",
                    properties: {
                        operation: { type: "string", enum: ["add", "subtract", "multiply", "divide"] },
                        a: { type: "number" },
                        b: { type: "number" }
                    },
                    required: ["operation", "a", "b"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_current_time",
                description: "Get the current time",
                parameters: { type: "object", properties: {} }
            }
        }
    ];
    
    try {
        const completion = await puter.ai.chat(prompt, { tools: tools, model: 'gpt-4o-mini' });
        
        let resultText = '';
        
        if (completion.message?.tool_calls && completion.message.tool_calls.length > 0) {
            const toolCall = completion.message.tool_calls[0];
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            resultText += `<strong>🔧 Function Called:</strong> ${functionName}<br>`;
            resultText += `<strong>📋 Arguments:</strong> ${JSON.stringify(args, null, 2)}<br><br>`;
            
            // Execute the function
            let functionResult = '';
            
            if (functionName === 'get_weather') {
                functionResult = `Weather in ${args.location}: 22°C, Partly Cloudy`;
            } else if (functionName === 'calculate') {
                const operations = {
                    add: (a, b) => a + b,
                    subtract: (a, b) => a - b,
                    multiply: (a, b) => a * b,
                    divide: (a, b) => a / b
                };
                functionResult = `Result: ${operations[args.operation](args.a, args.b)}`;
            } else if (functionName === 'get_current_time') {
                functionResult = `Current time: ${new Date().toLocaleString()}`;
            }
            
            resultText += `<strong>✅ Result:</strong> ${functionResult}<br><br>`;
            
            // Get final AI response with function result
            const finalResponse = await puter.ai.chat([
                { role: "user", content: prompt },
                completion.message,
                {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: functionResult
                }
            ], { model: 'gpt-4o-mini' });
            
            let finalText = '';
            if (typeof finalResponse === 'string') {
                finalText = finalResponse;
            } else if (finalResponse.message?.content) {
                finalText = Array.isArray(finalResponse.message.content)
                    ? finalResponse.message.content[0].text || finalResponse.message.content[0]
                    : finalResponse.message.content;
            }
            
            resultText += `<strong>🤖 AI Response:</strong><br>${finalText}`;
            
        } else {
            resultText = 'No function calls needed. Direct response: ' + JSON.stringify(completion);
        }
        
        outputBox.innerHTML = resultText.replace(/\n/g, '<br>');
        
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

// ==========================================
// FILE ANALYSIS
// ==========================================
function handleFileSelection(e) {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        document.getElementById('analyzeFileBtn').disabled = false;
        showNotification(`✅ File selected: ${selectedFile.name}`);
    }
}

async function analyzeFile() {
    if (!selectedFile) {
        alert('Please select a file first!');
        return;
    }
    
    const filePrompt = document.getElementById('filePrompt').value || 'Summarize this document';
    const outputBox = document.getElementById('fileResponseBox');
    const outputContainer = document.getElementById('fileOutput');
    outputContainer.classList.add('show');
    
    outputBox.innerHTML = '<div class="loading"><div class="spinner"></div> Uploading and analyzing file...</div>';
    
    try {
        // Upload file to Puter
        const puterFile = await puter.fs.write(
            `temp_${Date.now()}_${selectedFile.name}`,
            selectedFile
        );
        
        outputBox.innerHTML = '<div class="loading"><div class="spinner"></div> Analyzing with AI...</div>';
        
        // Analyze with AI
        const completion = await puter.ai.chat([
            {
                role: 'user',
                content: [
                    {
                        type: 'file',
                        puter_path: puterFile.path
                    },
                    {
                        type: 'text',
                        text: filePrompt
                    }
                ]
            }
        ], { model: 'claude-sonnet-4', stream: true });
        
        let fullText = `<strong>📄 File:</strong> ${selectedFile.name}<br><br><strong>Analysis:</strong><br><br>`;
        outputBox.innerHTML = fullText;
        
        for await (const part of completion) {
            const text = part?.text || '';
            fullText += text;
            outputBox.innerHTML = fullText.replace(/\n/g, '<br>');
        }
        
        // Clean up
        await puter.fs.delete(puterFile.path);
        
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

// ==========================================
// CLOUD STORAGE & KV DATABASE
// ==========================================
async function saveToKV() {
    const key = document.getElementById('kvKey').value;
    const value = document.getElementById('kvValue').value;
    
    if (!key || !value) {
        alert('Please enter both key and value!');
        return;
    }
    
    const outputBox = document.getElementById('storageResponseBox');
    const outputContainer = document.getElementById('storageOutput');
    outputContainer.classList.add('show');
    
    try {
        await puter.kv.set(key, value);
        outputBox.innerHTML = `<strong>✅ Saved to Cloud!</strong><br>Key: ${key}<br>Value: ${value}`;
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

async function loadFromKV() {
    const key = document.getElementById('kvKey').value;
    
    if (!key) {
        alert('Please enter a key!');
        return;
    }
    
    const outputBox = document.getElementById('storageResponseBox');
    const outputContainer = document.getElementById('storageOutput');
    outputContainer.classList.add('show');
    
    try {
        const value = await puter.kv.get(key);
        if (value) {
            document.getElementById('kvValue').value = value;
            outputBox.innerHTML = `<strong>✅ Loaded from Cloud!</strong><br>Key: ${key}<br>Value: ${value}`;
        } else {
            outputBox.innerHTML = `<strong>⚠️ Key not found:</strong> ${key}`;
        }
    } catch (error) {
        outputBox.innerHTML = `<strong style="color: red;">❌ Error:</strong><br>${error.message}`;
    }
}

// ==========================================
// STATS & HISTORY
// ==========================================
function updateStats(responseTime, text) {
    stats.totalQueries++;
    stats.totalResponseTime += responseTime;
    stats.totalTokens += Math.floor(text.length / 4); // Rough estimate
    
    document.getElementById('totalQueries').textContent = stats.totalQueries;
    document.getElementById('avgResponseTime').textContent = 
        Math.floor(stats.totalResponseTime / stats.totalQueries) + 'ms';
    document.getElementById('chatTime').textContent = responseTime + 'ms';
    document.getElementById('chatTokens').textContent = '~' + Math.floor(text.length / 4) + ' tokens';
    document.getElementById('totalTokens').textContent = stats.totalTokens;
    
    saveStats();
}

async function saveStats() {
    try {
        await puter.kv.set('app_stats', JSON.stringify(stats));
    } catch (e) {
        console.log('Stats save failed (not logged in)');
    }
}

async function loadStats() {
    try {
        const saved = await puter.kv.get('app_stats');
        if (saved) {
            stats = JSON.parse(saved);
            document.getElementById('totalQueries').textContent = stats.totalQueries;
            document.getElementById('avgResponseTime').textContent = 
                Math.floor(stats.totalResponseTime / stats.totalQueries) + 'ms';
            document.getElementById('totalTokens').textContent = stats.totalTokens;
        }
    } catch (e) {
        console.log('Stats load failed (not logged in)');
    }
}

function addToHistory(prompt, response, model, time) {
    const historyItem = {
        prompt: prompt,
        response: response,
        model: model,
        time: time,
        timestamp: Date.now()
    };
    
    queryHistory.unshift(historyItem);
    if (queryHistory.length > 50) queryHistory.pop(); // Keep last 50
    
    saveHistory();
    renderHistory();
}

async function saveHistory() {
    try {
        await puter.kv.set('query_history', JSON.stringify(queryHistory));
    } catch (e) {
        console.log('History save failed');
    }
}

async function loadHistory() {
    try {
        const saved = await puter.kv.get('query_history');
        if (saved) {
            queryHistory = JSON.parse(saved);
            renderHistory();
        }
    } catch (e) {
        console.log('History load failed');
    }
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    if (queryHistory.length === 0) {
        historyList.innerHTML = '<p style="color: #666;">No history yet. Start chatting!</p>';
        return;
    }
    
    historyList.innerHTML = '';
    queryHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => loadHistoryItem(index);
        
        const date = new Date(item.timestamp).toLocaleString();
        historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-model">${item.model}</span>
                <span class="history-time">${date} | ${item.time}ms</span>
            </div>
            <div class="history-prompt">${item.prompt}</div>
        `;
        historyList.appendChild(historyItem);
    });
}

function loadHistoryItem(index) {
    const item = queryHistory[index];
    document.getElementById('chatPrompt').value = item.prompt;
    
    const outputBox = document.getElementById('chatResponseBox');
    const outputContainer = document.getElementById('chatOutput');
    outputContainer.classList.add('show');
    
    outputBox.innerHTML = `
        <strong>From History (${item.model}):</strong><br><br>
        ${item.response.replace(/\n/g, '<br>')}
    `;
    
    switchTab('chat');
    document.querySelector('.tab[onclick*="chat"]').classList.add('active');
}

async function saveToHistory() {
    if (!lastResponse) {
        alert('No response to save!');
        return;
    }
    showNotification('✅ Response saved to history!');
}

// ==========================================
// UTILITIES
// ==========================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'chat-tab') {
            generateChat();
        }
    }
});

console.log('🚀 Ultimate Puter AI Hub Ready!');
console.log('💡 Press Ctrl+Enter to generate response');
console.log('📚 500+ models available across all providers');
