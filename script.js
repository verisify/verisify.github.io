import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyALc7_O7VJzigqOaVLYjcl5yCCysnmyOG0",
    authDomain: "rateniggov-419a4.firebaseapp.com",
    projectId: "rateniggov-419a4",
    storageBucket: "rateniggov-419a4.appspot.com",
    messagingSenderId: "293215706435",
    appId: "1:293215706435:web:bbf1190e97208185caa3f6",
    measurementId: "G-C2KSLESE2D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class Governor {
    constructor(id, rank, name, image, state, infrastructure, security, education, healthcare, jobs) {
        this.id = id;
        this.rank = rank;
        this.name = name;
        this.image = image;
        this.state = state;
        this.categories = {
            infrastructure: { votes: parseInt(infrastructure) || 0, userVote: null },
            security: { votes: parseInt(security) || 0, userVote: null },
            education: { votes: parseInt(education) || 0, userVote: null },
            healthcare: { votes: parseInt(healthcare) || 0, userVote: null },
            jobs: { votes: parseInt(jobs) || 0, userVote: null },
        };
        this.totalVotes = this.calculateTotalVotes();
    }

    calculateTotalVotes() {
        return Object.values(this.categories).reduce((total, category) => total + category.votes, 0);
    }

    async vote(category, type) {
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

        this.totalVotes = this.calculateTotalVotes();
        this.updateVotesDisplay(category);

        // Update Firestore
        const governorRef = doc(db, 'governors', this.id);
        await updateDoc(governorRef, {
            [`categories.${category}.votes`]: categoryData.votes,
            totalVotes: this.totalVotes
        });
    }

    updateVotesDisplay(category) {
        const categoryData = this.categories[category];
        document.querySelector(`#votes-${category}-${this.rank}`).textContent = categoryData.votes;
        document.querySelector(`#total-votes-${this.rank}`).textContent = this.totalVotes;

        const upvoteBtn = document.querySelector(`#upvote-${category}-${this.rank}`);
        const downvoteBtn = document.querySelector(`#downvote-${category}-${this.rank}`);

        upvoteBtn.classList.remove('text-blue-500');
        downvoteBtn.classList.remove('text-red-500');

        if (categoryData.userVote === 'upvoted') {
            upvoteBtn.classList.add('text-blue-500');
        } else if (categoryData.userVote === 'downvoted') {
            downvoteBtn.classList.add('text-red-500');
        }
    }

    render() {
        const createVoteSection = (category) => `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <button id="downvote-${category}-${this.rank}" class="downvote-btn inline-flex items-center justify-center p-1 me-3 text-sm font-medium h-6 w-6 text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" data-id="${this.rank}" data-category="${category}" type="button">
                        <span class="sr-only">Downvote</span>
                        <svg class="w-[46px] h-[46px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm5.757-1a1 1 0 1 0 0 2h8.486a1 1 0 1 0 0-2H7.757Z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    <span id="votes-${category}-${this.rank}" class="votes-count">${this.categories[category].votes}</span>
                    <button id="upvote-${category}-${this.rank}" class="upvote-btn inline-flex items-center justify-center h-6 w-6 p-1 ms-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" data-id="${this.rank}" data-category="${category}" type="button">
                        <span class="sr-only">Upvote</span>
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        return `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="p-4">${this.rank}</td>
                <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <img class="w-10 h-10 rounded-full" src="${this.image}" alt="${this.name}">
                    <div class="pl-3">
                        <div class="text-base font-semibold">${this.name}</div>
                        <div class="font-normal text-gray-500">${this.state}</div>
                    </div>
                </th>
                ${createVoteSection('infrastructure')}
                ${createVoteSection('security')}
                ${createVoteSection('education')}
                ${createVoteSection('healthcare')}
                ${createVoteSection('jobs')}
                <td class="px-6 py-4">
                    <span id="total-votes-${this.rank}">${this.totalVotes}</span>
                </td>
            </tr>
        `;
    }
}

let governors = [];

const renderGovernors = async (selectedWeek) => {
    const governorsRef = collection(db, 'governors');
    const governorRows = document.getElementById('governor-rows');

    try {
        const snapshot = await getDocs(governorsRef);
        governors = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const governor = new Governor(
                doc.id, data.rank, data.name, data.avatar, data.state, 
                data.categories.infrastructure.votes,
                data.categories.security.votes,
                data.categories.education.votes,
                data.categories.healthcare.votes,
                data.categories.jobs.votes
            );
            governors.push(governor);
        });

        // Sort governors based on the selected week
        sortGovernors(selectedWeek);

        // Clear existing rows
        governorRows.innerHTML = '';

        // Render sorted governors
        governors.forEach((governor, index) => {
            governor.rank = index + 1;
            governorRows.innerHTML += governor.render();
        });

        // Add event listeners for voting buttons
        document.querySelectorAll('.upvote-btn, .downvote-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const rank = button.dataset.id;
                const category = button.dataset.category;
                const type = button.classList.contains('upvote-btn') ? 'upvote' : 'downvote';
                const governor = governors.find(g => g.rank == rank);
                await governor.vote(category, type);
                sortGovernors(selectedWeek);
                renderGovernors(selectedWeek);
            });
        });
    } catch (error) {
        console.error("Error fetching governors:", error);
    }
};

const sortGovernors = (selectedWeek) => {
    const startDate = new Date(selectedWeek[0]);
    const endDate = new Date(selectedWeek[1]);
    const dayOfWeek = startDate.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 2) { // Monday to Tuesday
        governors.sort((a, b) => a.state.localeCompare(b.state));
    } else { // Wednesday to Sunday
        governors.sort((a, b) => b.totalVotes - a.totalVotes);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    var today = new Date();
    var weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Adjust to Sunday
    var weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000); // Advance to Saturday

    flatpickr("#weekPicker", {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: [weekStart, weekEnd],
        enableTime: false,
        locale: {
            firstDayOfWeek: 0
        },
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                var selectedDate = selectedDates[0];
                var weekStart = new Date(selectedDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Adjust to Sunday
                var weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000); // Advance to Saturday
                instance.setDate([weekStart, weekEnd]);
                renderGovernors([weekStart, weekEnd]);
            }
        },
        onClose: function(selectedDates, dateStr, instance) {
            if (selectedDates.length !== 2 || selectedDates[0].getDay() !== 0 || selectedDates[1].getDay() !== 6) {
                alert("Please select a full week starting from Sunday.");
                instance.clear();
            }
        }
    });

    // Initial render with current week
    renderGovernors([weekStart, weekEnd]);
});

// Function to check if it's a new voting week
const isNewVotingWeek = (currentDate) => {
    const monday = new Date(currentDate);
    monday.setDate(monday.getDate() - monday.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    return currentDate.getTime() === monday.getTime();
};

// Function to reset votes if it's a new voting week
const resetVotesIfNewWeek = async () => {
    const currentDate = new Date();
    if (isNewVotingWeek(currentDate)) {
        const governorsRef = collection(db, 'governors');
        const snapshot = await getDocs(governorsRef);

        snapshot.forEach(async (doc) => {
            const governorRef = doc.ref;
            await updateDoc(governorRef, {
                'categories.infrastructure.votes': 0,
                'categories.security.votes': 0,
                'categories.education.votes': 0,
                'categories.healthcare.votes': 0,
                'categories.jobs.votes': 0,
                totalVotes: 0
            });
        });

        console.log("Votes reset for the new week.");
    }
};

// Call resetVotesIfNewWeek function when the page loads
resetVotesIfNewWeek();
