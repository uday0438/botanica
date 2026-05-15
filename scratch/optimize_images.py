import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target the handleAnalyze function to add resizing
old_handle_analyze_start = "const handleAnalyze = async () => {"
new_handle_analyze_start = r"""const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
            };
        };
        reader.onerror = reject;
    });
};

  const handleAnalyze = async () => {"""

content = content.replace(old_handle_analyze_start, new_handle_analyze_start)

# Update the imagesData mapping to use resizeImage
old_images_mapping = r"""        const imagesData = await Promise.all(imageFiles.map(async (file) => {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const b64 = reader.result?.toString().split(',')[1];
                    if (b64) resolve(b64);
                    else reject(new Error('Failed to extract base64'));
                };
                reader.onerror = reject;
            });
            return { data: base64, mimeType: file.type };
        }));"""

new_images_mapping = r"""        const imagesData = await Promise.all(imageFiles.map(async (file) => {
            const base64 = await resizeImage(file);
            return { data: base64, mimeType: 'image/jpeg' };
        }));"""

content = content.replace(old_images_mapping, new_images_mapping)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully optimized image analysis in App.tsx")
