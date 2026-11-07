import { useState, useEffect, useRef } from "react";
import { CheckCircle, Upload, X, ChevronLeft, ChevronRight, Info, Image, Tag, DollarSign, Eye } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { getCategories, getCities, createProperty } from "../services/properties";
import type { CategoryResponse, CityResponse } from "../types/api";

interface AddListingWizardProps {
  onNavigate: (page: string) => void;
}

const STEPS = [
  { id: 1, label: "Объект", icon: Info },
  { id: 2, label: "Фото", icon: Image },
  { id: 3, label: "Удобства", icon: Tag },
  { id: 4, label: "Цены", icon: DollarSign },
  { id: 5, label: "Публикация", icon: Eye },
];

const AMENITIES_LIST = ["WiFi", "Парковка", "Пляж", "Бассейн", "Барбекю", "Кухня", "Стиральная машина", "Кондиционер", "Сауна", "Детская кровать", "Домашние животные", "Спортзал", "SPA", "Трансфер", "Завтрак включён"];

function ImageUpload({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) onChange([...images, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {images.map((url, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)", aspectRatio: "4/3" }}>
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-black/50"
            >
              <X size={12} color="white" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs font-medium bg-black/50 text-white">
                Главная
              </span>
            )}
          </div>
        ))}
        {images.length < 6 && (
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--border)", aspectRatio: "4/3" }}
          >
            <Upload size={20} style={{ color: "var(--text-secondary)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Добавить</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}

export function AddListingWizard({ onNavigate }: AddListingWizardProps) {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    city_id: "",
    price_per_night: "",
    max_guests: "4",
    bedrooms: "2",
    beds: "2",
    bathrooms: "1",
    amenities: [] as string[],
    images: [] as string[],
  });

  useEffect(() => {
    async function load() {
      try {
        const [cats, cits] = await Promise.all([getCategories(), getCities()]);
        setCategories(cats);
        setCities(cits);
      } catch {
        toast.error("Ошибка загрузки данных");
      }
    }
    load();
  }, []);

  const updateForm = (key: string, value: string | string[]) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter((x) => x !== a) : [...prev.amenities, a],
    }));
  };

  const canProceed = () => {
    if (step === 1) return form.title && form.category_id && form.city_id;
    if (step === 4) return form.price_per_night;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createProperty({
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        city_id: form.city_id,
        price_per_night: parseInt(form.price_per_night),
        max_guests: parseInt(form.max_guests),
        bedrooms: parseInt(form.bedrooms),
        beds: parseInt(form.beds),
        bathrooms: parseInt(form.bathrooms),
        amenities: form.amenities,
        images: form.images.length > 0 ? form.images : undefined,
      });
      onNavigate("owner-dashboard");
      } catch {
        toast.error("Ошибка при публикации объекта");
      } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <Helmet>
        <title>Добавить объект | IssykRelax</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => onNavigate("owner-dashboard")} className="flex items-center gap-1 text-sm mb-6 hover:underline" style={{ color: "var(--lake-blue)" }}>
          <ChevronLeft size={15} /> Назад
        </button>

        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Добавить объект</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Заполните все шаги для публикации вашего объявления</p>

        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button onClick={() => s.id < step && setStep(s.id)} className="flex flex-col items-center gap-1 group flex-shrink-0" disabled={s.id > step}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{
                  background: step === s.id ? "var(--lake-blue)" : step > s.id ? "var(--turquoise)" : "var(--surface)",
                  border: `2px solid ${step >= s.id ? (step > s.id ? "var(--turquoise)" : "var(--lake-blue)") : "var(--border)"}`,
                }}>
                  {step > s.id ? <CheckCircle size={16} color="white" /> : <s.icon size={15} color={step === s.id ? "white" : "var(--text-secondary)"} />}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: step === s.id ? "var(--lake-blue)" : "var(--text-secondary)" }}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-1" style={{ background: step > s.id ? "var(--turquoise)" : "var(--border)" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Информация об объекте</h2>
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>ТИП ОБЪЕКТА *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateForm("category_id", c.id)}
                      className="py-2 px-3 rounded-xl text-sm border transition-all"
                      style={{
                        background: form.category_id === c.id ? "var(--lake-blue)" : "var(--surface)",
                        color: form.category_id === c.id ? "white" : "var(--text-secondary)",
                        borderColor: form.category_id === c.id ? "var(--lake-blue)" : "var(--border)",
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>НАЗВАНИЕ ОБЪЯВЛЕНИЯ *</label>
                <input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="Напр. Уютный коттедж у озера" className="w-full border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>ОПИСАНИЕ</label>
                <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Расскажите о вашем объекте..." rows={4} className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>НАСЕЛЁННЫЙ ПУНКТ *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cities.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateForm("city_id", c.id)}
                      className="py-2 px-3 rounded-xl text-sm border transition-all"
                      style={{
                        background: form.city_id === c.id ? "var(--lake-blue)" : "var(--surface)",
                        color: form.city_id === c.id ? "white" : "var(--text-secondary)",
                        borderColor: form.city_id === c.id ? "var(--lake-blue)" : "var(--border)",
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>МАКС ГОСТЕЙ</label>
                  <input type="number" value={form.max_guests} onChange={(e) => updateForm("max_guests", e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>СПАЛЬНИ</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => updateForm("bedrooms", e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>КРОВАТЕЙ</label>
                  <input type="number" value={form.beds} onChange={(e) => updateForm("beds", e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>ВАННЫХ КОМНАТ</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => updateForm("bathrooms", e.target.value)} className="w-full border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Фотографии</h2>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Загрузите фотографии вашего объекта</p>
              <ImageUpload
                images={form.images}
                onChange={(images) => setForm((prev) => ({ ...prev, images }))}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Удобства и услуги</h2>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Отметьте всё, что доступно вашим гостям</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_LIST.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all"
                    style={{
                      background: form.amenities.includes(a) ? "var(--lake-blue-light)" : "var(--surface)",
                      borderColor: form.amenities.includes(a) ? "var(--lake-blue)" : "var(--border)",
                      color: form.amenities.includes(a) ? "var(--lake-blue)" : "var(--text-secondary)",
                    }}
                  >
                    {form.amenities.includes(a) && <CheckCircle size={13} style={{ color: "var(--lake-blue)" }} />}
                    {!form.amenities.includes(a) && <div className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: "var(--border)" }} />}
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Цены</h2>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>ЦЕНА ЗА НОЧЬ (Сом) *</label>
                <input type="number" value={form.price_per_night} onChange={(e) => updateForm("price_per_night", e.target.value)} placeholder="3500" className="w-full border rounded-xl px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }} />
              </div>
              <div className="p-4 rounded-xl" style={{ background: "var(--lake-blue-light)" }}>
                <p className="text-xs" style={{ color: "var(--lake-blue-dark)" }}>
                  💡 Объекты с ценой 3 000–6 000 Сом/ночь получают наибольшее количество просмотров на Иссык-Куле.
                </p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--turquoise-light)" }}>
                <CheckCircle size={32} style={{ color: "var(--turquoise)" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Готово к публикации!</h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                После публикации объект появится в результатах поиска.
              </p>
              <div className="text-left space-y-2 mb-6 p-4 rounded-xl" style={{ background: "var(--surface)" }}>
                {form.title && <div className="flex gap-2 text-sm"><span style={{ color: "var(--text-secondary)" }}>Название:</span><span style={{ color: "var(--text-primary)" }}>{form.title}</span></div>}
                {form.price_per_night && <div className="flex gap-2 text-sm"><span style={{ color: "var(--text-secondary)" }}>Цена:</span><span style={{ color: "var(--text-primary)" }}>{parseInt(form.price_per_night).toLocaleString()} Сом/ночь</span></div>}
                <div className="flex gap-2 text-sm"><span style={{ color: "var(--text-secondary)" }}>Удобства:</span><span style={{ color: "var(--text-primary)" }}>{form.amenities.length} выбрано</span></div>
                <div className="flex gap-2 text-sm"><span style={{ color: "var(--text-secondary)" }}>Фото:</span><span style={{ color: "var(--text-primary)" }}>{form.images.length} загружено</span></div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--lake-blue), var(--turquoise))" }}
              >
                {submitting ? "Публикация..." : "Опубликовать объект"}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <ChevronLeft size={15} /> Назад
            </button>
          )}
          {step < 5 && (
            <button onClick={() => canProceed() && setStep(step + 1)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all" style={{
              background: canProceed() ? "var(--lake-blue)" : "var(--surface)",
              color: canProceed() ? "white" : "var(--text-secondary)",
              cursor: canProceed() ? "pointer" : "not-allowed",
            }}>
              Далее <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
