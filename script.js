class Governor {
    constructor(rank, name, image, state) {
        this.rank = rank;
        this.name = name;
        this.image = image;
        this.state = state;
        this.categories = {
            infrastructure: { votes: 0, userVote: null },
            security: { votes: 0, userVote: null },
            education: { votes: 0, userVote: null },
            healthcare: { votes: 0, userVote: null },
            jobs: { votes: 0, userVote: null },
        };
    }

    vote(category, type) {
        const categoryData = this.categories[category];
        
        if (type === 'upvote') {
            if (categoryData.userVote === 'upvoted') {
                categoryData.votes -= 1;
                categoryData.userVote = null;
            } else {
                if (categoryData.userVote === 'downvoted') {
                    categoryData.votes += 1;
                }
                categoryData.votes += 1;
                categoryData.userVote = 'upvoted';
            }
        } else if (type === 'downvote') {
            if (categoryData.userVote === 'downvoted') {
                categoryData.votes += 1;
                categoryData.userVote = null;
            } else {
                if (categoryData.userVote === 'upvoted') {
                    categoryData.votes -= 1;
                }
                categoryData.votes -= 1;
                categoryData.userVote = 'downvoted';
            }
        }

        this.updateVotesDisplay(category);
    }

    updateVotesDisplay(category) {
        const categoryData = this.categories[category];
        document.querySelector(`#votes-${category}-${this.rank}`).textContent = categoryData.votes;

        const upvoteBtn = document.querySelector(`#upvote-${category}-${this.rank}`);
        const downvoteBtn = document.querySelector(`#downvote-${category}-${this.rank}`);

        if (categoryData.userVote === 'upvoted') {
            upvoteBtn.classList.add('text-blue-500');
            downvoteBtn.classList.remove('text-red-500');
        } else if (categoryData.userVote === 'downvoted') {
            downvoteBtn.classList.add('text-red-500');
            upvoteBtn.classList.remove('text-blue-500');
        } else {
            upvoteBtn.classList.remove('text-blue-500');
            downvoteBtn.classList.remove('text-red-500');
        }
    }

    render() {
        const createVoteSection = (category) => `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <button id="downvote-${category}-${this.rank}" class="downvote-btn inline-flex items-center justify-center p-1 me-3 text-sm font-medium h-6 w-6 text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" data-id="${this.rank}" data-category="${category}" type="button">
                        <span class="sr-only">Downvote</span>
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                        </svg>
                    </button>
                    <span id="votes-${category}-${this.rank}" class="votes-count">${this.categories[category].votes}</span>
                    <button id="upvote-${category}-${this.rank}" class="upvote-btn inline-flex items-center justify-center h-6 w-6 p-1 ms-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" data-id="${this.rank}" data-category="${category}" type="button">
                        <span class="sr-only">Upvote</span>
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        return `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="p-4">${this.rank}</td>
                <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <img class="w-10 h-10 rounded-full" src="${this.image}" alt="${this.name} image">
                    <div class="ps-3">
                        <div class="text-base font-semibold">${this.name}</div>
                                            <div class="font-normal text-gray-500">${this.state}</div>
                </div>
            </th>
            ${createVoteSection('infrastructure')}
            ${createVoteSection('security')}
            ${createVoteSection('education')}
            ${createVoteSection('healthcare')}
            ${createVoteSection('jobs')}
        </tr>`;
    }
}

// Initialize governors array with placeholder data
const governors = [
    new Governor(1, "Governor A", "https://via.placeholder.com/40", "State A"),
    new Governor(2, "Governor B", "https://via.placeholder.com/40", "State B"),
    // Add more governors as needed
];

// Function to render governors
const renderGovernors = () => {
    const governorRows = document.querySelector('#governor-rows');
    governorRows.innerHTML = governors.map(governor => governor.render()).join('');
    
    document.querySelectorAll('.upvote-btn').forEach(button => {
        button.addEventListener('click', handleVote);
    });

    document.querySelectorAll('.downvote-btn').forEach(button => {
        button.addEventListener('click', handleVote);
    });
};

// Function to handle votes
const handleVote = (event) => {
    const button = event.target.closest('button');
    const governorRank = button.getAttribute('data-id');
    const category = button.getAttribute('data-category');
    const type = button.classList.contains('upvote-btn') ? 'upvote' : 'downvote';

    const governor = governors.find(gov => gov.rank == governorRank);
    if (governor) {
        governor.vote(category, type);
        saveVoteToFirestore(governor, category, type);
    }
};

// Function to save vote to Firestore
const saveVoteToFirestore = async (governor, category, type) => {
    try {
        const docRef = db.collection('governors').doc(`governor-${governor.rank}`);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            const currentVotes = data.categories[category].votes;
            const updatedVotes = type === 'upvote' ? currentVotes + 1 : currentVotes - 1;

            await docRef.update({
                [`categories.${category}.votes`]: updatedVotes,
                [`categories.${category}.userVote`]: type === 'upvote' ? 'upvoted' : 'downvoted'
            });
        } else {
            await docRef.set({
                rank: governor.rank,
                name: governor.name,
                image: governor.image,
                state: governor.state,
                categories: governor.categories
            });
        }
    } catch (error) {
        console.error("Error saving vote to Firestore: ", error);
    }
};

// Function to load governors from Firestore
const loadGovernorsFromFirestore = async () => {
    try {
        const snapshot = await db.collection('governors').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            const governor = governors.find(gov => gov.rank == data.rank);
            if (governor) {
                governor.categories = data.categories;
            }
        });
        renderGovernors();
    } catch (error) {
        console.error("Error loading governors from Firestore: ", error);
    }
};

// Initial rendering of governors
renderGovernors();

// Load governors from Firestore
loadGovernorsFromFirestore();

