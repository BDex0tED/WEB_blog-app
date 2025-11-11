const STORAGE_KEY = 'staticBlogPosts';

function getPosts() {
    const posts = localStorage.getItem(STORAGE_KEY);
    return posts ? JSON.parse(posts) : [];
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function addPost(title, anons, fullText) {
    const posts = getPosts();
    const newPost = {
        id: Date.now(),
        title: title,
        anons: anons,
        fullText: fullText,
        date: new Date().toLocaleDateString(),
    };
    posts.unshift(newPost);
    savePosts(posts);
}

function getPostById(id) {
    const posts = getPosts();
    return posts.find(post => post.id == id);
}

function deletePost(id) {
    let posts = getPosts();
    posts = posts.filter(post => post.id != id);
    savePosts(posts);
}



function renderPosts() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    const posts = getPosts();
    postList.innerHTML = ''; 

    if (posts.length === 0) {
        postList.innerHTML = '<p class="text-muted">No posts found. Start adding one!</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.anons}</p>
            <a href="post-detail.html?id=${post.id}">Read More</a>
        `;
        postList.appendChild(postElement);
    });
}

function setupAddForm() {
    const form = document.getElementById('add-post-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const anons = document.getElementById('anons').value;
        const fullText = document.getElementById('full-text').value;
        
        if (title && anons && fullText) {
            addPost(title, anons, fullText);
            window.location.href = 'index.html'; 
        } else {
            alert('Please fill out all fields.');
        }
    });
}

function renderPostDetail() {
    const postDetail = document.getElementById('post-detail');
    if (!postDetail) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postDetail.innerHTML = '<p class="text-danger">Post ID is missing.</p>';
        return;
    }

    const post = getPostById(postId);

    if (post) {
        postDetail.innerHTML = `
            <h1>${post.title}</h1>
            <p class="post-date">Published: ${post.date}</p>
            <p class="post-content">${post.fullText.replace(/\n/g, '<br>')}</p>
            <button id="delete-btn" class="btn-danger">Delete Post</button>
            <a href="index.html" class="btn-back">← Back to Blog</a>
        `;



        document.getElementById('delete-btn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                deletePost(postId);
                window.location.href = 'index.html';
            }
        });

    } else {
        postDetail.innerHTML = '<p class="text-danger">Post not found.</p>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('page-home')) {
        renderPosts();
    } else if (document.body.classList.contains('page-add')) {
        setupAddForm();
    } else if (document.body.classList.contains('page-detail')) {
        renderPostDetail();
    }
});