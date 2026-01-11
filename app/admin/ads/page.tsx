"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Megaphone, Plus, Trash2, ExternalLink, Power, PowerOff, BarChart3, Image as ImageIcon, Loader2, Upload, Check } from "lucide-react"
import { getAllAds, createAd, updateAd, deleteAd, uploadAdImage, Ad } from "@/lib/services/adsService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const AD_VARIANTS = [
  { id: "banner", label: "بانر علوي (Banner)" },
  { id: "box", label: "مربع (Box)" },
  { id: "sidebar", label: "جانبي (Sidebar)" }
] as const;

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // Form state
  const [newAd, setNewAd] = useState<Omit<Ad, "id" | "createdAt" | "clicks">>({
    title: "",
    imageUrl: "",
    link: "",
    variants: ["banner"],
    active: true
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    setLoading(true)
    const data = await getAllAds()
    setAds(data)
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const url = await uploadAdImage(file)
      setNewAd(prev => ({ ...prev, imageUrl: url }))
    } catch (error) {
      alert("فشل في رفع الصورة")
    } finally {
      setIsUploading(false)
    }
  }

  const toggleVariant = (variantId: typeof AD_VARIANTS[number]["id"]) => {
    setNewAd(prev => {
      const exists = prev.variants.includes(variantId);
      if (exists) {
        return { ...prev, variants: prev.variants.filter(v => v !== variantId) };
      } else {
        return { ...prev, variants: [...prev.variants, variantId] };
      }
    });
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isUploading) return alert("يرجى الانتظار حتى اكتمال رفع الصورة")
    if (!newAd.imageUrl) return alert("يرجى رفع صورة للإعلان")
    if (newAd.variants.length === 0) return alert("يرجى اختيار مكان واحد على الأقل لظهور الإعلان")
    
    try {
      await createAd(newAd)
      setNewAd({ title: "", imageUrl: "", link: "", variants: ["banner"], active: true })
      setIsAdding(false)
      fetchAds()
    } catch (error) {
      alert("خطأ أثناء إنشاء الإعلان")
    }
  }

  const handleToggleActive = async (ad: Ad) => {
    if (!ad.id) return
    try {
      await updateAd(ad.id, { active: !ad.active })
      fetchAds()
    } catch (error) {
      alert("خطأ أثناء تحديث الحالة")
    }
  }

  const handleDelete = async (adId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return
    try {
      await deleteAd(adId)
      fetchAds()
    } catch (error) {
      alert("خطأ أثناء الحذف")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">إدارة الإعلانات</h2>
          <p className="text-slate-400 mt-1">التحكم في المساحات الإعلانية والبانرات</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto transition-all"
        >
          {isAdding ? "إلغاء الإضافة" : (
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              إضافة إعلان جديد
            </div>
          )}
        </Button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 overflow-hidden shadow-2xl"
        >
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">عنوان الإعلان</label>
                <Input 
                  value={newAd.title}
                  onChange={e => setNewAd({...newAd, title: e.target.value})}
                  placeholder="مثال: خصم 50% على اشتراكات الطلاب" 
                  className="bg-slate-950/50 border-slate-800 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">صورة الإعلان</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="ad-image-upload"
                    />
                    <label 
                      htmlFor="ad-image-upload"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all text-slate-400 hover:text-indigo-400"
                    >
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">
                        {newAd.imageUrl ? "تم اختيار صورة" : "ارفع صورة من الجهاز"}
                      </span>
                    </label>
                  </div>
                  {newAd.imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                      <img src={newAd.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">رابط التوجيه (Link)</label>
                <Input 
                  value={newAd.link}
                  onChange={e => setNewAd({...newAd, link: e.target.value})}
                  placeholder="https://example.com/promo" 
                  className="bg-slate-950/50 border-slate-800 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3 block">أماكن الظهور (Multiple selection)</label>
                <div className="grid grid-cols-1 gap-2">
                  {AD_VARIANTS.map((v) => (
                    <div 
                      key={v.id}
                      onClick={() => toggleVariant(v.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${newAd.variants.includes(v.id) ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      <span className="text-sm font-medium">{v.label}</span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${newAd.variants.includes(v.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700'}`}>
                        {newAd.variants.includes(v.id) && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold py-6 h-auto rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  {isUploading ? "جاري رفع الصورة..." : "تأكيد الإضافة ونشر الإعلان"}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Ads List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest">Fetching Encrypted Ad Streams...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-slate-500">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>لا يوجد إعلانات مضافة حالياً</p>
          </div>
        ) : ads.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border ${ad.active ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/20'} backdrop-blur-sm group transition-all hover:bg-slate-900/30`}
          >
            {/* Preview Image */}
            <div className="w-full md:w-48 h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative shadow-inner">
               {ad.imageUrl ? (
                 <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               ) : (
                 <ImageIcon className="w-8 h-8 text-slate-800" />
               )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className={ad.active ? 'text-emerald-400' : 'text-slate-500'}>
                  {ad.active ? 'Active' : 'Draft'}
                </span>
                <span className="text-slate-800">/</span>
                <div className="flex items-center gap-1">
                  {ad.variants.map((v) => (
                    <span key={v} className="bg-slate-800/50 px-1.5 py-0.5 rounded text-slate-400">{v}</span>
                  ))}
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-100">{ad.title}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-2 truncate max-w-md">
                <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0" />
                {ad.link}
              </p>
            </div>

            {/* Metrics */}
            <div className="px-8 border-x border-slate-800/50 hidden lg:block">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Clicks</span>
              </div>
              <p className="text-2xl font-black text-slate-100 tracking-tighter">{ad.clicks || 0}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleToggleActive(ad)}
                className={`p-3 rounded-xl border transition-all ${ad.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                title={ad.active ? "إيقاف" : "تفعيل"}
              >
                {ad.active ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => handleDelete(ad.id!)}
                className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                title="حذف"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
