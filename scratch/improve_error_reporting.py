import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Improve the error handling in handleAnalyze
old_error_handling = r"""        const responseData = await response.json();
        
        const result = responseData as CropAnalysis;
        
        // Basic validation to ensure we have required fields
        if (!result.diseaseResult || !result.solution) {
            throw new Error('Received incomplete data from analysis engine.');
        }"""

new_error_handling = r"""        const responseData = await response.json();
        
        // Check for backend errors
        if (!response.ok) {
            throw new Error(responseData.error || 'The AI engine is currently overloaded. Please try again.');
        }

        const result = responseData as CropAnalysis;
        
        // Basic validation to ensure we have required fields
        if (!result.diseaseResult || !result.solution) {
            console.error('Malformed AI Response:', result);
            throw new Error('The AI provided an incomplete diagnosis. Please try a clearer photo.');
        }"""

content = content.replace(old_error_handling, new_error_handling)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully improved error reporting in App.tsx")
