document.addEventListener('DOMContentLoaded', () => {
    // Shared Logic: Product Card Listeners
    function attachProductListeners() {
        // Product Card Redirection
        document.querySelectorAll('.product-card').forEach(card => {
            // Clone to remove old listeners if re-attaching (for pagination)
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', (e) => {
                if (e.target.closest('.wishlist-btn')) return;
                const productId = newCard.dataset.id;
                window.location.href = `product-detail.html?id=${productId}`;
            });
        });

        // Wishlist Toggle
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                newBtn.classList.toggle('active');
            });
        });
    }

    // Home Page Logic
    const productsRow = document.getElementById('products-row');
    if (productsRow) {
        async function fetchProducts() {
            try {
                const response = await axios.get('https://dummyjson.com/products?limit=8');
                const products = response.data.products;
                
                productsRow.innerHTML = products.map(product => `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="product-card" data-id="${product.id}">
                            <div class="product-img-container">
                                <img src="${product.thumbnail}" alt="${product.title}" class="product-img">
                                <button class="wishlist-btn"><i class="bi bi-heart"></i></button>
                            </div>
                            <div class="product-info p-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <h5 class="product-title mb-1">${product.title}</h5>
                                    <span class="product-price fw-bold">${product.price}$</span>
                                </div>
                                <p class="product-desc text-muted small mb-0">${product.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('');

                attachProductListeners();
            } catch (error) {
                console.error('Error fetching products:', error);
                productsRow.innerHTML = '<div class="col-12 text-center text-danger">Failed to load products.</div>';
            }
        }
        fetchProducts();
    }

    // All Products Page Logic (Pagination)
    const allProductsRow = document.getElementById('all-products-row');
    const showMoreBtn = document.getElementById('show-more-btn');
    if (allProductsRow && showMoreBtn) {
        let skip = 0;
        const limit = 21;

        async function fetchAllProducts() {
            try {
                showMoreBtn.disabled = true;
                showMoreBtn.textContent = 'Loading...';

                const response = await axios.get(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
                const products = response.data.products;
                
                if (products.length === 0) {
                    showMoreBtn.style.display = 'none';
                    return;
                }

                const productsHtml = products.map(product => `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="product-card" data-id="${product.id}">
                            <div class="product-img-container">
                                <img src="${product.thumbnail}" alt="${product.title}" class="product-img">
                                <button class="wishlist-btn"><i class="bi bi-heart"></i></button>
                            </div>
                            <div class="product-info p-3">
                                <div class="d-flex justify-content-between align-items-start">
                                    <h5 class="product-title mb-1">${product.title}</h5>
                                    <span class="product-price fw-bold">${product.price}$</span>
                                </div>
                                <p class="product-desc text-muted small mb-0">${product.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('');

                allProductsRow.insertAdjacentHTML('beforeend', productsHtml);
                skip += limit;

                if (skip >= response.data.total) {
                    showMoreBtn.style.display = 'none';
                } else {
                    showMoreBtn.disabled = false;
                    showMoreBtn.textContent = 'Show More';
                }

                attachProductListeners();
            } catch (error) {
                console.error('Error fetching products:', error);
                if (skip === 0) {
                    allProductsRow.innerHTML = '<div class="col-12 text-center text-danger">Failed to load products.</div>';
                }
                showMoreBtn.disabled = false;
                showMoreBtn.textContent = 'Show More';
            }
        }

        showMoreBtn.addEventListener('click', fetchAllProducts);
        fetchAllProducts();
    }

    // Product Detail Page Logic
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId && document.getElementById('product-title')) {
        async function fetchProductDetail() {
            try {
                const response = await axios.get(`https://dummyjson.com/products/${productId}`);
                const product = response.data;

                // Update DOM
                document.getElementById('product-detail-img').src = product.thumbnail;
                document.getElementById('product-detail-img').alt = product.title;
                document.getElementById('product-title').textContent = product.title;
                document.getElementById('product-price').textContent = `$${product.price}`;
                document.getElementById('product-brand').textContent = `Brand: ${product.brand || 'N/A'}`;
                
                // Update Badge (e.g., use category)
                document.getElementById('product-badge').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);

                // Features List
                const featuresList = document.getElementById('product-features-list');
                const features = [
                    `Rating: ${product.rating} / 5`,
                    `Stock: ${product.stock} units`,
                    `Category: ${product.category}`,
                    `Warranty: ${product.warrantyInformation || 'Standard'}`,
                    `Shipping: ${product.shippingInformation || 'Standard'}`
                ];
                featuresList.innerHTML = features.map(f => `<li class="mb-2">${f}</li>`).join('');

            } catch (error) {
                console.error('Error fetching product detail:', error);
                document.getElementById('product-title').textContent = 'Product Not Found';
            }
        }
        fetchProductDetail();
    }

    const sizeBtns = document.querySelectorAll('.size-btn');
    if (sizeBtns.length > 0) {
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const alertContainer = document.getElementById('alert-container');
    if (addToCartBtn && alertContainer) {
        addToCartBtn.addEventListener('click', () => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success alert-dismissible fade show shadow-sm border-0 rounded-pill px-4';
            alertDiv.role = 'alert';
            alertDiv.innerHTML = `
                <i class="bi bi-check-circle-fill me-2"></i> 
                <strong>Success!</strong> Item added to cart.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            alertContainer.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.classList.remove('show');
                setTimeout(() => alertDiv.remove(), 150);
            }, 2000);
        });
    }
});
