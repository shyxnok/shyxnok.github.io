const fs = require('fs/promises');
const path = require('path'); 
function log(...txt){
    for (let i = 0; i<txt.length; i++) {
              console.log(txt[i])
        }
}
function err(...txt){
      for (let i = 0; i<txt.length; i++) {
              console.error(txt[i])
        }
  
}
class FLFParser {
    constructor() {
        this.metadata = null;
        this.fonts = {};
        this.commentLines = [];
    }

    /**
     * 解析FLF字体文件内容
     * @param {string} content - FLF文件的文本内容
     * @returns {Object} 解析后的字体数据
     */
    parse(content) {
        // 清除之前的解析结果
        this.metadata = null;
        this.fonts = {};
        this.commentLines = [];

        // 按行分割内容
        const lines = content.split('\n')
            // .map(line => line.trimEnd()) // 移除行尾空白
            // .filter(line => line !== ''); // 过滤空行
        if (lines.length === 0) {
            throw new Error('无效的FLF文件，内容为空');
        }

        // 解析头部标识行
        this._parseHeader(lines[0]);
        // 解析注释行
        const commentLinesCount = Math.max(0, this.metadata.commentLines);
        for (let i = 1; i <= commentLinesCount && i < lines.length; i++) {
            this.commentLines.push(lines[i]);
        }

        // 解析字符数据（跳过头部和注释行）
        const charDataLines = lines.slice(1 + commentLinesCount);
        this._parseCharacters(charDataLines);
        return {
            metadata: this.metadata,
            commentLines: this.commentLines,
            fonts: this.fonts
        };
    }
    /**
     * 解析头部标识行
     * 格式: flf2a$ 高度 基线 最大宽度 注释行数 字符间距
     */
    _parseHeader(headerLine) {
        if (!headerLine.startsWith('flf2a$')) {
            throw new Error('不是有效的FLF文件，缺少标识头flf2a$');
        }

        const parts = headerLine.split(/\s+/);
        if (parts.length < 6) {
            throw new Error('FLF文件头格式不正确');
        }

        this.metadata = {
            signature: parts[0],
            height: parseInt(parts[1], 10),
           baseline  : parseInt(parts[2], 10),
            maxWidth: parseInt(parts[3], 10),
            charSpacing : parseInt(parts[4], 10),
            commentLines : parseInt(parts[5], 10)
        };
        // 验证数值有效性
        Object.keys(this.metadata).forEach(key => {
            if (key !== 'signature' && isNaN(this.metadata[key])) {
                throw new Error(`FLF文件头参数无效: ${key}`);
            }
        });
    }
    /**
     * 解析头部标识行
     * 格式: flf2a$ 高度 基线 最大宽度 注释行数 字符间距
     * 解析字符数据
     */
    _parseCharacters(lines) {
        const { height } = this.metadata;
        let currentCharCode = 32; // 从空格字符开始 (ASCII 32)
        let currentCharLines = [];
        for (const line of lines) {
            const cleanedLine = line.replace(/@|\$/g, '');
            currentCharLines.push(cleanedLine);
            // 当收集到足够的行数（等于字体高度），表示一个字符解析完成
            if (currentCharLines.length === height) {
                // 将字符添加到字体映射表
                const char = String.fromCharCode(currentCharCode);
                this.fonts[char] = [...currentCharLines];
                
                // 重置并准备解析下一个字符
                currentCharLines = [];
                currentCharCode++;
            }
        }
    }

    /**
     * 使用解析后的字体生成ASCII艺术
     * @param {string} text - 要转换的文本
     * @returns {string} 生成的ASCII艺术
     */
    generateAsciiArt(text) {
        if (!this.metadata || Object.keys(this.fonts).length === 0) {
            throw new Error('请先解析FLF字体文件');
        }

        const { height } = this.metadata;
        const resultLines = Array(height).fill('');
        for (const char of text) {
            const charLines = this.fonts[char] || this.fonts[' '] || Array(height).fill('');
            for (let i = 0; i < height; i++) {
                resultLines[i] += charLines[i] || '';
                resultLines[i]=resultLines[i].replace(/\r|#/g,'')
                // resultLines[i] += ' '.repeat(Math.max(1, 2));
            }

        }
        return resultLines.join('\n');
    }
}

async function demo() {
    try {
        const response = await fetch(' http://127.0.0.1:8080/ANSI Shadow.flf');
        if (!response.ok) {
            throw new Error('无法加载FLF文件');
        }

        const flfContent = await response.text();
        const parser = new FLFParser();
        const fontData = parser.parse(flfContent);
        // log('字体数据:', fontData.fonts);
        // log('字体元数据:', fontData.metadata);
        log('支持的字符:', Object.keys(fontData.fonts).join(','));
        
        // // 生成ASCII艺术
        const asciiArt = parser.generateAsciiArt('bgcode');
        log('生成的ASCII艺术:\n',asciiArt);
        
        return asciiArt;
    } catch (error) {
        err('解析出错:', error.message);
    }
}

// 运行示例
demo();
