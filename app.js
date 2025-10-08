// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    // Clear output
    document.getElementById('output').style.display = 'none';
}

// Show output section
function showOutput(content, isLoading = false) {
    const output = document.getElementById('output');
    output.style.display = 'block';
    
    if (isLoading) {
        output.innerHTML = '<span class="loading">' + content + '</span>';
    } else {
        output.innerHTML = content;
    }
}

// Generate Text Response
async function generateText() {
    const prompt = document.getElementById('prompt').value;
    const model = document.getElementById('model-select').value;
    
    if (!prompt) {
        alert('Please enter a prompt!');
        return;
    }
    
    showOutput('⏳ Generating response...', true);
    
    try {
        const response = await puter.ai.chat(prompt, { model: model });
        showOutput('<strong>Response:</strong><br><br>' + response);
    } catch (error) {
        showOutput('<strong style="color: red;">Error:</strong><br>' + error.message);
    }
}

// Stream Text Response
async function streamText() {
    const prompt = document.getElementById('prompt').value;
    const model = document.getElementById('model-select').value;
    
    if (!prompt) {
        alert('Please enter a prompt!');
        return;
    }
    
    showOutput('⏳ Streaming response...', true);
    
    try {
        const response = await puter.ai.chat(prompt, {
            model: model,
            stream: true
        });
        
        let fullText = '<strong>Streaming Response:</strong><br><br>';
        showOutput(fullText);
        
        for await (const part of response) {
            fullText += part?.text || '';
            showOutput(fullText);
        }
    } catch (error) {
        showOutput('<strong style="color: red;">Error:</strong><br>' + error.message);
    }
}

// Generate Image
async function generateImage() {
    const prompt = document.getElementById('image-prompt').value;
    
    if (!prompt) {
        alert('Please enter an image description!');
        return;
    }
    
    showOutput('🎨 Generating image... This may take a moment...', true);
    
    try {
        const imageElement = await puter.ai.txt2img(prompt, { 
            model: "gpt-image-1" 
        });
        
        // Display the image
        const output = document.getElementById('output');
        output.style.display = 'block';
        output.innerHTML = '<strong>Generated Image:</strong><br><br>';
        output.appendChild(imageElement);
    } catch (error) {
        showOutput('<strong style="color: red;">Error:</strong><br>' + error.message);
    }
}

// Analyze Image
async function analyzeImage() {
    const imageUrl = document.getElementById('image-url').value;
    const visionPrompt = document.getElementById('vision-prompt').value;
    
    if (!imageUrl || !visionPrompt) {
        alert('Please enter both image URL and question!');
        return;
    }
    
    showOutput('🔍 Analyzing image...', true);
    
    try {
        const response = await puter.ai.chat(
            visionPrompt,
            imageUrl,
            { model: "gpt-5-nano" }
        );
        
        showOutput('<strong>Analysis:</strong><br><br>' + response);
    } catch (error) {
        showOutput('<strong style="color: red;">Error:</strong><br>' + error.message);
    }
}

// Sample prompts on page load
window.onload = function() {
    console.log('✅ Puter.js loaded successfully!');
    console.log('Ready to use GPT-5 and other AI models for free!');
};
