import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useGameState } from '../systems/GameStateContext';
import { useToast } from '../systems/ToastContext';
import { spendGold } from '../systems/gameEngine';
import { logActivity, ACTIVITY_TYPES } from '../systems/activityLogger';
import useDocumentTitle from '../systems/useDocumentTitle';
import './Shop.css';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'avatars' | 'boosts' | 'badges' | string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'avatar-pack-1',
    name: 'avatarPack1',
    description: 'avatarPack1Desc',
    price: 500,
    icon: '🎭',
    category: 'avatars',
  },
  {
    id: 'avatar-pack-2',
    name: 'avatarPack2',
    description: 'avatarPack2Desc',
    price: 750,
    icon: '🎪',
    category: 'avatars',
  },
  {
    id: 'xp-boost',
    name: 'xpBoost',
    description: 'xpBoostDesc',
    price: 1000,
    icon: '⚡',
    category: 'boosts',
  },
  {
    id: 'streak-freeze',
    name: 'streakFreeze',
    description: 'streakFreezeDesc',
    price: 300,
    icon: '❄️',
    category: 'boosts',
  },
  {
    id: 'hint-token',
    name: 'hintToken',
    description: 'hintTokenDesc',
    price: 150,
    icon: '💡',
    category: 'boosts',
  },
  {
    id: 'premium-badge',
    name: 'premiumBadge',
    description: 'premiumBadgeDesc',
    price: 2000,
    icon: '👑',
    category: 'badges',
  },
];

export default function Shop() {
  useDocumentTitle('Shop');
  const { t } = useTranslation();
  const { progress, updateProgress } = useGameState();
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const gold = progress.gold || 0;
  const purchasedItems = progress.purchasedItems || [];

  const handlePurchase = (item: ShopItem) => {
    if (gold < item.price) {
      showToast(t('shop.notEnoughGold'), 'error');
      return;
    }

    if (purchasedItems.includes(item.id)) {
      showToast(t('shop.alreadyOwned'), 'warning');
      return;
    }

    const updatedState = spendGold(progress, item.price);
    updatedState.purchasedItems = [...purchasedItems, item.id];

    updateProgress(updatedState);
    logActivity(ACTIVITY_TYPES.SHOP_PURCHASE, { itemId: item.id, price: item.price }, `Purchased ${item.id} from shop`);
    showToast(t('shop.purchaseSuccess', { name: t(`shop.items.${item.name}`) }), 'success');
  };

  const filteredItems = activeCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="shop-page">
      <div className="shop-container">
        <header className="shop-header">
          <div className="shop-header-title">
            <h1>🛒 {t('shop.title')}</h1>
            <p>{t('shop.subtitle')}</p>
          </div>
          <div className="shop-gold-card">
            <span className="shop-gold-icon">🪙</span>
            <span className="shop-gold-amount">{gold}</span>
            <span className="shop-gold-label">{t('shop.gold')}</span>
          </div>
        </header>

        <div className="shop-categories">
          {['all', 'avatars', 'boosts', 'badges'].map((cat) => (
            <button
              key={cat}
              className={`shop-category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {t(`shop.categories.${cat}`)}
            </button>
          ))}
        </div>

        <div className="shop-grid">
          {filteredItems.map((item) => {
            const isOwned = purchasedItems.includes(item.id);
            const canAfford = gold >= item.price;

            return (
              <div key={item.id} className={`shop-card ${isOwned ? 'owned' : ''}`}>
                <div className="shop-card-icon">{item.icon}</div>
                <h3>{t(`shop.items.${item.name}`)}</h3>
                <p>{t(`shop.items.${item.description}`)}</p>
                <div className="shop-card-footer">
                  <span className="shop-card-price">🪙 {item.price}</span>
                  <button
                    className={`btn ${isOwned ? 'btn-secondary' : canAfford ? 'btn-primary' : 'btn-disabled'}`}
                    disabled={isOwned || !canAfford}
                    onClick={() => handlePurchase(item)}
                  >
                    {isOwned ? t('shop.owned') : t('shop.buy')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
