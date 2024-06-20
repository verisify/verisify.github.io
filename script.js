class Governor {
    constructor(rank, name, image, email) {
        this.rank = rank;
        this.name = name;
        this.image = image;
        this.email = email;
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
                        <div class="font-normal text-gray-500">${this.email}</div>
                    </div>
                </th>
                ${createVoteSection('infrastructure')}
                ${createVoteSection('security')}
                ${createVoteSection('education')}
                ${createVoteSection('healthcare')}
                ${createVoteSection('jobs')}
            </tr>
        `;
    }
}

const governors = [
    new Governor(1, "Governor 1", "/path/to/image1.jpg", "governor1@example.com"),
    new Governor(2, "Governor 2", "/path/to/image2.jpg", "governor2@example.com"),
    // Add more governors here
];

document.addEventListener('DOMContentLoaded', () => {
    const governorRows = document.getElementById('governor-rows');
    
    governors.forEach(governor => {
        governorRows.insertAdjacentHTML('beforeend', governor.render());
    });

    document.querySelectorAll('.upvote-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const rank = event.currentTarget.getAttribute('data-id');
            const category = event.currentTarget.getAttribute('data-category');
            governors[rank - 1].vote(category, 'upvote');
        });
    });

    document.querySelectorAll('.downvote-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const rank = event.currentTarget.getAttribute('data-id');
            const category = event.currentTarget.getAttribute('data-category');
            governors[rank - 1].vote(category, 'downvote');
        });
    });
});