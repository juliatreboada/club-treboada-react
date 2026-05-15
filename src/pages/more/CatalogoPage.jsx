// src/pages/more/CatalogPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import OptimizedImage from '../../components/OptimizedImage';
import catalogData, { categories } from '../../data/catalogData';
import styles from './CatalogPage.module.css';

const Catalog = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter products based on active category
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') {
      return catalogData;
    }
    return catalogData.filter(product => 
      product.categories.includes(activeFilter)
    );
  }, [activeFilter]);

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  // Handle product click to open modal
  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // Handle order button click
  const handleOrderClick = () => {
    window.open('https://forms.gle/uJcTCxPP4EA4X6sn7', '_blank');
  };

  return (
    <div className={styles.catalogPage}>
      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Catálogo Equipación Club Treboada</h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="container">
        {/* Order Button */}
        <div className={styles.orderButtonContainer}>
          <button 
            className={styles.orderButton}
            onClick={handleOrderClick}
          >
            Hacer mi pedido 📋
          </button>
        </div>

        {/* Filters */}
        <section className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`${styles.filterButton} ${
                  activeFilter === category.filter ? styles.active : ''
                }`}
                onClick={() => setActiveFilter(category.filter)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={styles.productCard}
                onClick={() => handleProductClick(product)}
              >
                <div className={styles.productImageContainer}>
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>{product.price}</p>
                  <div className={styles.productCategories}>
                    {product.categories.slice(0, 2).map(cat => (
                      <span key={cat} className={styles.categoryTag}>
                        {categories.find(c => c.filter === cat)?.label || cat}
                      </span>
                    ))}
                    {product.categories.length > 2 && (
                      <span className={styles.categoryTag}>
                        +{product.categories.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            No hay productos en esta categoría
          </div>
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal}>
              ×
            </button>
            
            <div className={styles.modalGrid}>
              <div className={styles.modalImageContainer}>
                <OptimizedImage
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className={styles.modalImage}
                />
              </div>
              
              <div className={styles.modalInfo}>
                <h2 className={styles.modalTitle}>{selectedProduct.name}</h2>
                <p className={styles.modalPrice}>{selectedProduct.price}</p>
                
                {selectedProduct.description && (
                  <p className={styles.modalDescription}>
                    {selectedProduct.description}
                  </p>
                )}
                
                <div className={styles.modalCategories}>
                  {selectedProduct.categories.map(cat => (
                    <span key={cat} className={styles.modalCategoryTag}>
                      {categories.find(c => c.filter === cat)?.label || cat}
                    </span>
                  ))}
                </div>
                
                <button 
                  className={styles.modalOrderButton}
                  onClick={handleOrderClick}
                >
                  Añadir al pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;