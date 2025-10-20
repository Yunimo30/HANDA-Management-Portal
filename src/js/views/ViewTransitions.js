export function addViewTransitions() {
    // Add transition classes to all view containers
    document.querySelectorAll('.view-container').forEach(container => {
        container.classList.add('transition-all', 'duration-300', 'ease-in-out');
    });

    // Add hover effects to all buttons
    document.querySelectorAll('button, .btn-primary, .btn-secondary').forEach(button => {
        button.classList.add(
            'transition-all',
            'duration-200',
            'ease-in-out',
            'transform',
            'hover:scale-105',
            'active:scale-95',
            'hover:shadow-lg'
        );
    });

    // Add hover effects to all cards
    document.querySelectorAll('.card, .bg-white').forEach(card => {
        card.classList.add(
            'transition-all',
            'duration-300',
            'ease-in-out',
            'transform',
            'hover:scale-[1.02]',
            'hover:shadow-lg',
            'hover:z-10'
        );
    });

    // Add hover effects to navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.add(
            'transition-all',
            'duration-200',
            'ease-in-out',
            'relative',
            'hover:text-blue-500'
        );
    });

    // Add hover effects to form inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.classList.add(
            'transition-all',
            'duration-200',
            'ease-in-out',
            'focus:ring-2',
            'focus:ring-blue-500',
            'focus:border-blue-500'
        );
    });
}

export function animateViewChange(container) {
    // First fade out
    container.classList.add('opacity-0', 'translate-y-4', 'transform');
    container.classList.add('transition-all', 'duration-300', 'ease-in-out');

    // Then fade in
    setTimeout(() => {
        container.classList.remove('opacity-0', 'translate-y-4');
        container.classList.add('opacity-100', 'translate-y-0');
    }, 50);
}

export function setupMobileMenuTransitions() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenu.classList.contains('block');
            
            if (!isExpanded) {
                // Show menu
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('block', 'opacity-0', 'scale-95');
                setTimeout(() => {
                    mobileMenu.classList.remove('opacity-0', 'scale-95');
                    mobileMenu.classList.add('opacity-100', 'scale-100');
                }, 50);
            } else {
                // Hide menu
                mobileMenu.classList.remove('opacity-100', 'scale-100');
                mobileMenu.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    mobileMenu.classList.remove('block');
                    mobileMenu.classList.add('hidden');
                }, 300);
            }
        });
    }
}