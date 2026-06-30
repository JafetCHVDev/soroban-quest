import React, { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useGameState } from '../systems/GameStateContext';
import { useToast } from '../systems/ToastContext';
import useDocumentTitle from '../systems/useDocumentTitle';
import './Shop.css';

const SHOP_ITEMS = [
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchasedItems, setPurchasedItems] = useState([]);

  const categories = [
    { id: 'all', name: 'shop.categories.all' },
    { id: 'avatars', name: 'shop.categories.avatars' },
    { id: 'boosts', name: 'shop.categories.boosts' },
    { id: 'badges', name: 'shop.categories.badges' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const handlePurchase = (item) => {
    if (purchasedItems.includes(item.id)) {
      showToast(t('shop.alreadyPurchased'), 'error');
      return;
    }

    if (progress.xp < item.price) {
      showToast(t('shop.insufficientFunds'), 'error');
      return;
    }

    const newXP = progress.xp - item.price;
    updateProgress({ ...progress, xp: newXP });
    setPurchasedItems([...purchasedItems, item.id]);
    showToast(t('shop.purchaseSuccess', { item: t(`shop.items.${item.name}`) }), 'success');
  };

  return (
    <div id="main-content" className="shop-page">
      <section className="shop-header">
        <div>
          <h1 className="shop-title">{t('shop.title')}</h1>
          <p className="shop-subtitle">{t('shop.subtitle')}</p>
        </div>
        <div className="shop-balance">
          <div className="balance-icon">💰</div>
          <div className="balance-amount">{progress.xp} XP</div>
        </div>
      </section>

      <nav className="shop-categories" aria-label={t('shop.ariaCategories')}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`shop-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
            aria-pressed={selectedCategory === category.id}
          >
            {t(category.name)}
          </button>
        ))}
      </nav>

      <div className="shop-grid">
        {filteredItems.map((item) => {
          const isPurchased = purchasedItems.includes(item.id);
          const canAfford = progress.xp >= item.price;

          return (
            <article
              key={item.id}
              className={`shop-item ${isPurchased ? 'purchased' : ''} ${!canAfford && !isPurchased ? 'unaffordable' : ''}`}
            >
              <div className="shop-item-icon">{item.icon}</div>
              <div className="shop-item-content">
                <h3 className="shop-item-name">{t(`shop.items.${item.name}`)}</h3>
                <p className="shop-item-description">{t(`shop.items.${item.description}`)}</p>
                <div className="shop-item-price">
                  {item.price} XP
                </div>
              </div>
              <button
                type="button"
                className={`shop-item-btn ${isPurchased ? 'purchased' : 'btn-primary'}`}
                onClick={() => handlePurchase(item)}
                disabled={isPurchased || !canAfford}
                aria-label={
                  isPurchased
                    ? t('shop.ariaPurchased', { item: t(`shop.items.${item.name}`) })
                    : t('shop.ariaPurchase', { item: t(`shop.items.${item.name}`), price: item.price })
                }
              >
                {isPurchased ? t('shop.purchased') : t('shop.buy')}
              </button>
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="shop-empty">
          <div className="shop-empty-icon">📦</div>
          <p>{t('shop.empty')}</p>
        </div>
      )}
    </div>
  );
}
