from PIL import Image
import os

def convert_png_to_ico(png_path, ico_path):
    try:
        if not os.path.exists(png_path):
            print(f"Error: {png_path} not found.")
            return False
            
        img = Image.open(png_path)
        img.save(ico_path, format='ICO', sizes=[(256, 256)])
        print(f"Successfully converted {png_path} to {ico_path}")
        return True
    except ImportError:
        print("Error: Pillow library not found. Please run 'pip install Pillow'")
        return False
    except Exception as e:
        print(f"Error converting icon: {str(e)}")
        return False

if __name__ == "__main__":
    convert_png_to_ico("resources/icon.png", "resources/icon.ico")
