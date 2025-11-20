const API_URL = "https://691efa51bb52a1db22bfea97.mockapi.io/blog/posts";

async function getPosts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return [];
    }
}

async function addPost(title, anons, fullText) {
    const newPost = {
        title: title,
        anons: anons,
        full_text: fullText,
        date: Math.floor(Date.now() / 1000),
    };
    console.log("Sending:", newPost);


    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        });
        
        if (!response.ok) {
            const errorBody = await response.text(); 
            throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Failed to add post:", error);
        throw error; 
    }
}

async function getPostById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (response.status === 404) {
             return null;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch post with ID ${id}:`, error);
        return null;
    }
}

async function deletePost(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json(); 
    } catch (error) {
        console.error(`Failed to delete post with ID ${id}:`, error);
        throw error;
    }
}

async function renderPosts() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = '<p class="text-info">Loading posts...</p>'; 

    const posts = await getPosts();
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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        const anons = document.getElementById('anons').value.trim();
        const fullText = document.getElementById('full-text').value.trim();
        
        if (title && anons && fullText) {
            try {
                await addPost(title, anons, fullText); 
                window.location.href = 'index.html'; 
            } catch (error) {
                alert('Failed to save post. Check console for details.');
            }
        } else {
            alert('Please fill out all fields.');
        }
    });
}

async function renderPostDetail() {
    const postDetail = document.getElementById('post-detail');
    if (!postDetail) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postDetail.innerHTML = '<p class="text-danger">Post ID is missing.</p>';
        return;
    }
    
    postDetail.innerHTML = '<p class="text-info">Loading post details...</p>';

    const post = await getPostById(postId);

    if (post) {
        const displayDate = post.date 
            ? new Date(parseInt(post.date)).toLocaleDateString() 
            : 'N/A';
            
        postDetail.innerHTML = `
            <h1>${post.title}</h1>
            <p class="post-date">Published: ${displayDate}</p>
            <p class="post-content">${post.full_text.replace(/\n/g, '<br>')}</p>
            <button id="delete-btn" class="btn-danger">Delete Post</button>
            <a href="index.html" class="btn-back">← Back to Blog</a>
        `;

        document.getElementById('delete-btn').addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                try {
                    await deletePost(postId);
                    window.location.href = 'index.html';
                } catch (error) {
                    alert('Failed to delete post. Check console for details.');
                }
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