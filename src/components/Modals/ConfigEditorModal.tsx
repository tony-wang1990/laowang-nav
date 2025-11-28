import { useState, useEffect } from 'react';
import { Code, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';
import { useConfigStore } from '../../store/useConfigStore';
import configService from '../../services/configService';

interface ConfigEditorModalProps {
    onClose: () => void;
}

export default function ConfigEditorModal({ onClose }: ConfigEditorModalProps) {
    const { config, updateConfig } = useConfigStore();
    const [yamlContent, setYamlContent] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (config) {
            setYamlContent(configService.toYAML(config));
        }
    }, [config]);

    const handleSave = () => {
        const result = configService.parseYAML(yamlContent);

        if (result.success && result.config) {
            updateConfig(result.config);
            setErrors([]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setErrors(result.errors || ['解析失败']);
        }
    };

    const handleReset = () => {
        if (config) {
            setYamlContent(configService.toYAML(config));
            setErrors([]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p- bg-black/50 backdrop-blur-sm">
            <div className="glass rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Code className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-white">配置编辑器</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition text-sm"
                        >
                            重置
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition"
                        >
                            <Save className="w-4 h-4" />
                            保存
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Status Messages */}
                {saved && (
                    <div className="mx-6 mt-4 p-4 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        配置已保存！
                    </div>
                )}

                {errors.length > 0 && (
                    <div className="mx-6 mt-4 p-4 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-semibold">配置错误：</span>
                        </div>
                        <ul className="text-sm space-y-1 ml-7">
                            {errors.map((error, i) => (
                                <li key={i}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Editor */}
                <div className="flex-1 p-6 overflow-hidden">
                    <div className="h-full bg-[#2d2d2d] rounded-lg overflow-hidden border border-white/10">
                        <Editor
                            value={yamlContent}
                            onValueChange={setYamlContent}
                            highlight={(code) => highlight(code, languages.yaml, 'yaml')}
                            padding={16}
                            style={{
                                fontFamily: '"Fira Code", "Courier New", monospace',
                                fontSize: 14,
                                lineHeight: 1.6,
                                minHeight: '100%',
                                backgroundColor: '#2d2d2d',
                                color: '#ccc',
                            }}
                            className="min-h-full"
                        />
                    </div>
                </div>

                {/* Help */}
                <div className="p-6 border-t border-white/10">
                    <div className="flex items-start gap-3 text-sm text-gray-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="mb-1">编辑YAML配置文件。保存前会自动验证格式。</p>
                            <p className="text-xs">
                                参考：
                                <a
                                    href="https://github.com/Lissy93/dashy/blob/master/docs/configuring.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline ml-1"
                                >
                                    Dashy配置文档
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
