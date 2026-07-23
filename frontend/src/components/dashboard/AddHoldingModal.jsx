import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Loader2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE, apiCall } from '../../api';

const AddHoldingModal = ({ isOpen, onClose, onAdd }) => {
    const [ticker, setTicker] = useState('');
    const { t } = useTranslation();
    const [qty, setQty] = useState('');
    const [avgPrice, setAvgPrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const searchStock = async () => {
        if (!ticker.trim()) return;
        setSearching(true);
        setError('');
        try {
            const res = await apiCall(`/search/?ticker=${ticker.trim()}`);
            if (!res.ok) throw new Error('Stock not found');
            const data = await res.json();
            setSearchResult(data);
            if (data.price && !avgPrice) {
                setAvgPrice(data.price.toString());
            }
        } catch (e) {
            setError(t('stock_not_found'));
            setSearchResult(null);
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async () => {
        if (!ticker.trim() || !qty || !avgPrice) {
            setError(t('fill_required_fields'));
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await onAdd({
                ticker: ticker.trim().toUpperCase(),
                qty: parseInt(qty),
                avg_price: parseFloat(avgPrice),
                purchase_date: purchaseDate || null
            });
            setSuccess(true);
            setTimeout(() => {
                resetForm();
                onClose();
            }, 1200);
        } catch (e) {
            setError(e.message || t('failed_add_holding'));
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setTicker('');
        setQty('');
        setAvgPrice('');
        setPurchaseDate('');
        setSearchResult(null);
        setSuccess(false);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-md bento-panel bg-[#0A0A0A] border border-[#222222] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between bg-[#111111]">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            {t('add_stock_holding')}
                        </h3>
                        <button onClick={() => { resetForm(); onClose(); }} className="p-1.5 hover:bg-[#1A1A1A] rounded-md transition-colors">
                            <X size={16} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Success State */}
                    {success ? (
                        <div className="p-12 flex flex-col items-center gap-4">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                <CheckCircle size={48} className="text-emerald-400" />
                            </motion.div>
                            <p className="text-lg font-bold text-white">{t('holding_added_success')}</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            {/* Stock Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                    {t('stock_symbol')} *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ticker}
                                        onChange={e => setTicker(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && searchStock()}
                                        placeholder="e.g. RELIANCE, TCS, INFY"
                                        className="bento-input flex-1"
                                    />
                                    <button
                                        onClick={searchStock}
                                        disabled={searching}
                                        className="bento-panel bg-[#111111] hover:bg-[#1A1A1A] border-[#222222] text-white px-4 flex items-center justify-center transition-colors rounded-lg border"
                                    >
                                        {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                    </button>
                                </div>
                                {searchResult && (
                                    <div className="mt-3 p-3 bg-[#1A1A1A] border border-[#222222] rounded-lg">
                                        <p className="text-sm font-medium text-white">{searchResult.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            CMP: ₹{searchResult.price} • {searchResult.suggestion || 'Market'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Quantity & Price */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                        {t('quantity')} *
                                    </label>
                                    <input
                                        type="number"
                                        value={qty}
                                        onChange={e => setQty(e.target.value)}
                                        placeholder="10"
                                        min="1"
                                        className="bento-input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                        {t('avg_buy_price')} *
                                    </label>
                                    <input
                                        type="number"
                                        value={avgPrice}
                                        onChange={e => setAvgPrice(e.target.value)}
                                        placeholder="1500.00"
                                        step="0.01"
                                        className="bento-input w-full"
                                    />
                                </div>
                            </div>

                            {/* Purchase Date (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                                    {t('purchase_date_optional')}
                                </label>
                                <input
                                    type="date"
                                    value={purchaseDate}
                                    onChange={e => setPurchaseDate(e.target.value)}
                                    className="bento-input w-full"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-xs text-red-500 font-medium">{error}</p>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !ticker || !qty || !avgPrice}
                                className="premium-button w-full mt-4 bg-white text-black hover:bg-gray-200 flex items-center justify-center font-bold py-3 rounded-xl transition-colors"
                            >
                                {submitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> {t('adding')}</>
                                ) : (
                                    <><Plus size={16} /> {t('add_to_portfolio')}</>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddHoldingModal;
