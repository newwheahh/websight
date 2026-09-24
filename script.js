/* =========================================
   INITIAL DATA
========================================= */

let posts = JSON.parse(
    localStorage.getItem("shareVaultPosts")
) || [

    {
        id: 1,
        type: "document",
        title: "Competitive Exam Study Notes",
        description:
            "Useful study material and revision notes.",
        category: "Education",
        icon: "📄",
        url: "#"
    },

    {
        id: 2,
        type: "link",
        title: "Useful Learning Website",
        description:
            "A useful online resource for students.",
        category: "Education",
        icon: "🔗",
        url: "https://example.com"
    },

    {
        id: 3,
        type: "video",
        title: "Introduction to Web Development",
        description:
            "Learn the fundamentals of modern websites.",
        category: "Technology",
        icon: "🎥",
        url: ""
    }

];


let currentFilter = "all";


/* =========================================
   DOM
========================================= */

const contentGrid =
    document.getElementById("contentGrid");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const postModal =
    document.getElementById("postModal");

const loginModal =
    document.getElementById("loginModal");

const postForm =
    document.getElementById("postForm");

const postType =
    document.getElementById("postType");


/* =========================================
   RENDER
========================================= */

function renderPosts() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered =
        posts.filter(post => {

            const matchesFilter =
                currentFilter === "all" ||
                post.type === currentFilter;


            const matchesSearch =
                post.title
                    .toLowerCase()
                    .includes(search) ||

                post.description
                    .toLowerCase()
                    .includes(search) ||

                post.category
                    .toLowerCase()
                    .includes(search);


            return (
                matchesFilter &&
                matchesSearch
            );

        });


    contentGrid.innerHTML = "";


    if (!filtered.length) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filtered.forEach(post => {

        const card =
            document.createElement("article");

        card.className =
            "content-card";


        let buttonText =
            "Open Content";


        if (post.type === "document") {
            buttonText = "View Document";
        }

        if (post.type === "video") {
            buttonText = "Watch Video";
        }

        if (post.type === "link") {
            buttonText = "Visit Link";
        }


        card.innerHTML = `

            <div class="card-preview">

                ${post.icon || getIcon(post.type)}

            </div>

            <div class="card-body">

                <div class="card-meta">

                    <span class="badge">
                        ${post.category}
                    </span>

                    <span>
                        ${capitalize(post.type)}
                    </span>

                </div>

                <h3>
                    ${escapeHTML(post.title)}
                </h3>

                <p>
                    ${escapeHTML(post.description)}
                </p>

                <button
                    class="card-action"
                    onclick="openContent(${post.id})">

                    ${buttonText}

                </button>

            </div>
        `;


        contentGrid.appendChild(card);

    });


    updateStats();

}


/* =========================================
   ICON
========================================= */

function getIcon(type) {

    if (type === "link") {
        return "🔗";
    }

    if (type === "document") {
        return "📄";
    }

    if (type === "video") {
        return "🎥";
    }

    return "📁";
}


/* =========================================
   FILTER
========================================= */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter;


                renderPosts();

            }
        );

    });


searchInput.addEventListener(
    "input",
    renderPosts
);


/* =========================================
   MODAL
========================================= */

function openPostModal(type = "link") {

    postModal.classList.add("show");

    switchPostType(type);

}


function closePostModal() {

    postModal.classList.remove("show");

    postForm.reset();

    switchPostType("link");

}


document
    .querySelectorAll(".post-tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                switchPostType(
                    tab.dataset.type
                );

            }
        );

    });


function switchPostType(type) {

    postType.value = type;


    document
        .querySelectorAll(".post-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.type === type
            );

        });


    document
        .getElementById("linkField")
        .classList.toggle(
            "hidden",
            type !== "link"
        );


    document
        .getElementById("documentField")
        .classList.toggle(
            "hidden",
            type !== "document"
        );


    document
        .getElementById("videoField")
        .classList.toggle(
            "hidden",
            type !== "video"
        );

}


/* =========================================
   CREATE POST
========================================= */

postForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const type =
            postType.value;


        const title =
            document
                .getElementById("postTitle")
                .value
                .trim();


        const description =
            document
                .getElementById("postDescription")
                .value
                .trim();


        const category =
            document
                .getElementById("postCategory")
                .value;


        let url = "";

        let icon =
            getIcon(type);


        /* LINK */

        if (type === "link") {

            url =
                document
                    .getElementById("linkURL")
                    .value
                    .trim();


            if (!url) {

                alert(
                    "Please enter a website URL."
                );

                return;

            }

        }


        /* DOCUMENT */

        if (type === "document") {

            const file =
                document
                    .getElementById("documentFile")
                    .files[0];


            if (!file) {

                alert(
                    "Please select a document."
                );

                return;

            }


            icon = getFileIcon(file.name);

            /*
                DEMO ONLY

                The real file is NOT uploaded
                to a server.

                We only save its name.
            */

            url =
                `#document-${Date.now()}`;

        }


        /* VIDEO */

        if (type === "video") {

            const file =
                document
                    .getElementById("videoFile")
                    .files[0];


            if (!file) {

                alert(
                    "Please select a video."
                );

                return;

            }


            icon = "🎥";


            /*
                Create temporary browser URL.

                This works during the current
                browser session.
            */

            url =
                URL.createObjectURL(file);


            playUploadedVideo(file);

        }


        const newPost = {

            id:
                Date.now(),

            type,

            title,

            description:
                description ||
                "No description provided.",

            category,

            icon,

            url

        };


        posts.unshift(newPost);


        /*
            Save metadata locally.
        */

        localStorage.setItem(
            "shareVaultPosts",
            JSON.stringify(posts)
        );


        closePostModal();


        renderPosts();


        showToast(
            "Content published successfully."
        );

    }
);


/* =========================================
   OPEN CONTENT
========================================= */

function openContent(id) {

    const post =
        posts.find(
            item => item.id === id
        );


    if (!post) {
        return;
    }


    if (post.type === "link") {

        if (
            post.url &&
            post.url !== "#"
        ) {

            window.open(
                post.url,
                "_blank"
            );

        } else {

            alert(
                "This demo link does not have a destination."
            );

        }

        return;

    }


    if (post.type === "video") {

        if (post.url) {

            playVideoURL(
                post.url
            );

            document
                .getElementById("videos")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }

        return;

    }


    if (post.type === "document") {

        alert(
            "Document preview/download requires backend storage in the production version."
        );

    }

}


/* =========================================
   VIDEO PLAYER
========================================= */

function playUploadedVideo(file) {

    const video =
        document.getElementById(
            "demoVideo"
        );

    const placeholder =
        document.getElementById(
            "videoPlaceholder"
        );


    const url =
        URL.createObjectURL(file);


    video.src = url;

    video.style.display = "block";

    placeholder.style.display = "none";


    video.load();

}


function playVideoURL(url) {

    const video =
        document.getElementById(
            "demoVideo"
        );

    const placeholder =
        document.getElementById(
            "videoPlaceholder"
        );


    video.src = url;

    video.style.display = "block";

    placeholder.style.display = "none";


    video.play().catch(() => {});

}


/* =========================================
   FILE ICON
========================================= */

function getFileIcon(filename) {

    const extension =
        filename
            .split(".")
            .pop()
            .toLowerCase();


    if (extension === "pdf") {
        return "📕";
    }

    if (
        extension === "doc" ||
        extension === "docx"
    ) {
        return "📘";
    }

    if (
        extension === "ppt" ||
        extension === "pptx"
    ) {
        return "📙";
    }

    if (
        extension === "xls" ||
        extension === "xlsx"
    ) {
        return "📗";
    }

    if (extension === "zip") {
        return "🗜️";
    }

    return "📄";

}


/* =========================================
   STATS
========================================= */

function updateStats() {

    const documents =
        posts.filter(
            post =>
                post.type === "document"
        ).length;


    const videos =
        posts.filter(
            post =>
                post.type === "video"
        ).length;


    document
        .getElementById("totalPosts")
        .textContent =
        posts.length;


    document
        .getElementById("totalDocuments")
        .textContent =
        documents;


    document
        .getElementById("totalVideos")
        .textContent =
        videos;

}


/* =========================================
   LOGIN
========================================= */

function openLogin() {

    loginModal.classList.add("show");

}


function closeLogin() {

    loginModal.classList.remove("show");

}


function fakeLogin(event) {

    event.preventDefault();

    closeLogin();

    showToast(
        "Demo login successful."
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.querySelector("p")
        .textContent = message;


    toast.classList.add("show");


    setTimeout(
        () => {

            toast.classList.remove("show");

        },
        3000
    );

}


/* =========================================
   DARK MODE
========================================= */

const themeToggle =
    document.getElementById(
        "themeToggle"
    );


themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "shareVaultTheme",
            dark
                ? "dark"
                : "light"
        );


        themeToggle.textContent =
            dark
                ? "☀"
                : "☾";

    }
);


if (
    localStorage.getItem(
        "shareVaultTheme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    themeToggle.textContent = "☀";

}


/* =========================================
   MOBILE MENU
========================================= */

const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );


const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


mobileMenuBtn.addEventListener(
    "click",
    () => {

        mobileMenu.classList.toggle(
            "show"
        );

    }
);


/* =========================================
   CLOSE MODALS
========================================= */

window.addEventListener(
    "click",
    event => {

        if (
            event.target === postModal
        ) {

            closePostModal();

        }


        if (
            event.target === loginModal
        ) {

            closeLogin();

        }

    }
);


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   CAPITALIZE
========================================= */

function capitalize(value) {

    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


/* =========================================
   INITIAL RENDER
========================================= */

renderPosts();