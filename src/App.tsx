import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Upload, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Target, 
  Eye, 
  UserCircle, 
  Filter,
  RefreshCcw,
  Camera,
  Video
} from 'lucide-react';
import { analyzeProfile, ShineAnalysis } from './services/geminiService';

// --- Components ---

const Pill: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
    active 
      ? 'bg-shine-purple text-white shadow-lg shadow-shine-purple/20' 
      : 'bg-white border border-gray-100 text-gray-500'
  }`}>
    {children}
  </span>
);

const Card = ({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-8 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 rounded-2xl bg-shine-purple/10 text-shine-purple">
        <Icon size={20} />
      </div>
      <h3 className="text-xl font-display text-shine-ink">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const ShimmerLoader = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-8">
    <div className="relative w-32 h-32">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          borderRadius: ["24%", "50%", "24%"]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full bg-gradient-to-tr from-shine-purple to-shine-blue opacity-20 blur-2xl"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sparkles size={48} className="text-shine-purple" />
      </motion.div>
    </div>
    <div className="text-center">
      <h2 className="text-2xl font-display mb-2">Shine анализирует профиль</h2>
      <p className="text-gray-400 animate-pulse">Ищем ваш истинный потенциал...</p>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'intro' | 'form' | 'upload' | 'analyzing' | 'result'>('intro');
  const [formData, setFormData] = useState({
    about: '',
    experience: '',
    sphere: '',
    format: '',
    specialization: ''
  });
  const [media, setMedia] = useState<Array<{ base64: string; type: string; name: string }>>([]);
  const [analysis, setAnalysis] = useState<ShineAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => setStep('form');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('upload');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const newMedia = await Promise.all(filesArray.map((file: File) => {
        return new Promise<{ base64: string; type: string; name: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              base64: reader.result as string,
              type: file.type,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      }));
      setMedia(prev => [...prev, ...newMedia]);
    }
  };

  const runAnalysis = async () => {
    setStep('analyzing');
    try {
      const result = await analyzeProfile(formData, media.map(m => ({ base64: m.base64, type: m.type })));
      setAnalysis(result);
      setStep('result');
    } catch (error) {
      console.error("Analysis failed", error);
      setStep('form');
    }
  };

  const reset = () => {
    setStep('intro');
    setFormData({ about: '', experience: '', sphere: '', format: '', specialization: '' });
    setMedia([]);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-12 flex flex-col">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-shine-purple flex items-center justify-center text-white shadow-lg shadow-shine-purple/30">
            <Sparkles size={20} />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">Shine AI</span>
        </div>
        {step === 'result' && (
          <button 
            onClick={reset}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
          >
            <RefreshCcw size={20} />
          </button>
        )}
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8 py-12"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl leading-[1.1]">
                  Узнай как тебя видит рынок <br />
                  <span className="text-shine-purple">вместе с Shine</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-md mx-auto leading-relaxed">
                  Экспертный ИИ-помощник для медиа-специалистов. Анализируем работы, находим таланты, стыкуем с заказчиками.
                </p>
              </div>
              <button 
                onClick={handleStart}
                className="group relative px-8 py-4 bg-shine-ink text-white rounded-full font-medium text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Начать анализ <ChevronRight size={20} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-shine-purple to-shine-blue opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl">Расскажите о себе</h2>
                <p className="text-gray-500">Это поможет ИИ лучше понять ваш контекст.</p>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Кратко о себе</span>
                    <textarea 
                      required
                      value={formData.about}
                      onChange={e => setFormData({...formData, about: e.target.value})}
                      placeholder="Например: Я создаю динамичные Reels для бьюти-брендов с упором на сторителлинг..."
                      className="mt-2 w-full p-4 glass-card bg-white focus:ring-2 focus:ring-shine-purple outline-none min-h-[120px] resize-none"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Специализация</span>
                      <select 
                        required
                        value={formData.specialization}
                        onChange={e => setFormData({...formData, specialization: e.target.value})}
                        className="mt-2 w-full p-4 glass-card bg-white focus:ring-2 focus:ring-shine-purple outline-none appearance-none"
                      >
                        <option value="">Выбрать...</option>
                        <option>Видеомейкер</option>
                        <option>Оператор</option>
                        <option>Монтажер</option>
                        <option>Редактор</option>
                        <option>Фотограф</option>
                        <option>Сценарист</option>
                        <option>Сторисмейкер</option>
                        <option>Продюсер</option>
                        <option>Контент-менеджер</option>
                        <option>СММ</option>
                        <option>Дизайнер</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Опыт</span>
                      <select 
                        required
                        value={formData.experience}
                        onChange={e => setFormData({...formData, experience: e.target.value})}
                        className="mt-2 w-full p-4 glass-card bg-white focus:ring-2 focus:ring-shine-purple outline-none appearance-none"
                      >
                        <option value="">Выбрать...</option>
                        <option>до 1 года</option>
                        <option>1-2 года</option>
                        <option>более 3 лет</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Сфера</span>
                      <input 
                        required
                        value={formData.sphere}
                        onChange={e => setFormData({...formData, sphere: e.target.value})}
                        placeholder="Бьюти, Мода..."
                        className="mt-2 w-full p-4 glass-card bg-white focus:ring-2 focus:ring-shine-purple outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Формат</span>
                      <input 
                        required
                        value={formData.format}
                        onChange={e => setFormData({...formData, format: e.target.value})}
                        placeholder="Reels, Фото..."
                        className="mt-2 w-full p-4 glass-card bg-white focus:ring-2 focus:ring-shine-purple outline-none"
                      />
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-shine-ink text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  Далее <ChevronRight size={20} />
                </button>
              </form>
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('form')} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-3xl">Загрузите работу</h2>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative p-12 glass-card border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 ${
                  media.length > 0 ? 'border-shine-purple bg-shine-purple/5' : 'border-gray-200 hover:border-shine-purple hover:bg-shine-purple/5'
                }`}
              >
                <input 
                  type="file" 
                  hidden 
                  multiple
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                />
                
                {media.length > 0 ? (
                  <>
                    <div className="flex -space-x-4 overflow-hidden">
                      {media.slice(0, 3).map((m, i) => (
                        <div key={i} className="w-16 h-16 rounded-2xl bg-shine-purple text-white flex items-center justify-center shadow-lg border-4 border-white">
                          {m.type.startsWith('video') ? <Video size={24} /> : <Camera size={24} />}
                        </div>
                      ))}
                      {media.length > 3 && (
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center shadow-lg border-4 border-white font-bold">
                          +{media.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-shine-ink">Загружено {media.length} файлов</p>
                      <p className="text-sm text-gray-400">Портфолио готово к анализу</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-shine-purple group-hover:text-white transition-colors">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="font-medium text-shine-ink">Нажмите или перетащите файлы</p>
                      <p className="text-sm text-gray-400">Загрузите несколько работ для комплексного анализа</p>
                    </div>
                  </>
                )}
              </div>

              <button 
                disabled={media.length === 0}
                onClick={runAnalysis}
                className={`w-full py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-all ${
                  media.length > 0 
                    ? 'bg-shine-purple text-white shadow-xl shadow-shine-purple/20 hover:scale-[1.02]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Запустить Shine AI <Sparkles size={20} />
              </button>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShimmerLoader />
            </motion.div>
          )}

          {step === 'result' && analysis && (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 pb-20"
            >
              {!analysis.passed ? (
                <div className="space-y-6">
                  <div className="text-center space-y-4 py-8">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                      <XCircle size={40} />
                    </div>
                    <h2 className="text-3xl">Работа не прошла модерацию</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">{analysis.rejectionReason}</p>
                  </div>
                  
                  <Card title="Технические шаги" icon={Zap}>
                    <ul className="space-y-4">
                      {analysis.technicalSteps?.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-shine-purple/10 text-shine-purple flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-gray-600">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                  
                  <button 
                    onClick={() => setStep('upload')}
                    className="w-full py-4 bg-shine-ink text-white rounded-full font-medium"
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-2 mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium mb-4">
                      <CheckCircle2 size={16} /> Модерация пройдена
                    </div>
                    <h2 className="text-4xl">Ваш анализ готов</h2>
                    <p className="text-gray-500">Используйте эти данные в профиле Shine</p>
                  </div>

                  <Card title="Как тебя видит рынок" icon={Target}>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <Pill active>{analysis.marketPerception?.level}</Pill>
                        <Pill active>{analysis.marketPerception?.price}</Pill>
                      </div>
                      <p className="text-gray-600 leading-relaxed italic">
                        "{analysis.marketPerception?.impression}"
                      </p>
                    </div>
                  </Card>

                  <Card title="Твой Match DNA" icon={Zap}>
                    <div className="flex flex-wrap gap-3">
                      {analysis.matchDNA?.map((dna, i) => (
                        <Pill key={i} active>{dna}</Pill>
                      ))}
                    </div>
                  </Card>

                  <Card title="Слепые зоны профиля" icon={Eye}>
                    <p className="text-gray-600 leading-relaxed">
                      {analysis.blindSpots}
                    </p>
                  </Card>

                  <Card title="Рекомендуемое позиционирование" icon={UserCircle}>
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">О себе (Bio)</h4>
                        <p className="text-shine-ink font-medium leading-relaxed">
                          {analysis.positioning?.bio}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ваш опыт</h4>
                        <p className="text-gray-600 leading-relaxed">
                          {analysis.positioning?.experience}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card title="Smart-Настройка фильтров" icon={Filter}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Специализация</h4>
                          <Pill active>{analysis.filters?.specialization}</Pill>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Формат контента</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.filters?.contentFormat?.map((f, i) => <Pill key={i}>{f}</Pill>)}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Сфера проекта</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.filters?.sphere?.map((s, i) => <Pill key={i}>{s}</Pill>)}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Платформа</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.filters?.platform?.map((p, i) => <Pill key={i}>{p}</Pill>)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Тип заказчика</h4>
                            <Pill>{analysis.filters?.clientType}</Pill>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Опыт</h4>
                            <Pill>{analysis.filters?.experience}</Pill>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Стиль</h4>
                          <Pill active>{analysis.filters?.style}</Pill>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Твой Match DNA готов. Используй эти данные в профиле Shine.
                    </p>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full py-4 border-2 border-gray-100 text-gray-500 rounded-full font-medium hover:bg-gray-50 transition-colors"
                  >
                    Создать новый анализ
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
