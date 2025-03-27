// Inicializar ou carregar carrinho do localStorage
let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
updateCartCount();

// Função para atualizar contador do carrinho
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Função para adicionar produto ao carrinho
function addToCart(product) {
    // Verificar se o produto já está no carrinho
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
        // Produto já existe, incrementa quantidade
        cart[existingProductIndex].quantity += product.quantity || 1;
    } else {
        // Produto não existe, adiciona ao carrinho
        if (!product.quantity) product.quantity = 1;
        cart.push(product);
    }
    
    // Salva no localStorage
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
    
    // Feedback visual
    alert('Produto adicionado ao carrinho!');
}

// Função para remover produto do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
    
    // Se estiver na página do carrinho, atualiza a renderização
    if (typeof renderCart === 'function') {
        renderCart();
    }
}

// Função para atualizar quantidade de um produto
function updateCartItemQuantity(productId, quantity) {
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        if (quantity <= 0) {
            // Se quantidade for zero ou negativa, remove o produto
            removeFromCart(productId);
        } else {
            // Atualiza a quantidade
            cart[productIndex].quantity = quantity;
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            updateCartCount();
            
            // Se estiver na página do carrinho, atualiza a renderização
            if (typeof renderCart === 'function') {
                renderCart();
            }
        }
    }
}

// Função para limpar o carrinho
function clearCart() {
    cart = [];
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
    
    // Se estiver na página do carrinho, atualiza a renderização
    if (typeof renderCart === 'function') {
        renderCart();
    }
}

// Função para calcular o total do carrinho
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
} 