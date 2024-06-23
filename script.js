import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
    constructor(rank, name, image, state, infrastructure, security, education, healthcare, jobs) {
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
                        <svg class="w-[46px] h-[46px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm5.757-1a1 1 0 1 0 0 2h8.486a1 1 0 1 0 0-2H7.757Z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                    <span id="votes-${category}-${this.rank}" class="votes-count">${this.categories[category].votes}</span>
                    <button id="upvote-${category}-${this.rank}" class="upvote-btn inline-flex items-center justify-center h-6 w-6 p-1 ms-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" data-id="${this.rank}" data-category="${category}" type="button">
                        <span class="sr-only">Upvote</span>
                        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 15l-6-6-6 6"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        return `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="w-4 p-4">${this.rank}</td>
                <td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <img class="w-10 h-10 rounded-full" src="${this.image}" alt="${this.name}">
                    <div class="pl-3">
                        <div class="text-base font-semibold">${this.name}</div>
                        <div class="font-normal text-gray-500">${this.state}</div>
                    </div>
                </td>
                ${createVoteSection('infrastructure')}
                ${createVoteSection('security')}
                ${createVoteSection('education')}
                ${createVoteSection('healthcare')}
                ${createVoteSection('jobs')}
            </tr>
        `;
    }
}

let governors = [];
let currentWeekStart;
let currentWeekEnd;

document.addEventListener('DOMContentLoaded', async function() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    currentWeekStart = weekStart;
    currentWeekEnd = weekEnd;

    flatpickr("#weekPicker", {
        mode: "range",
        dateFormat: "l, F j",
        defaultDate: [weekStart, weekEnd],
        enableTime: false,
        locale: {
            firstDayOfWeek: 0
        },
        maxDate: weekEnd,
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                const selectedDate = selectedDates[0];
                const weekStart = new Date(selectedDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
                instance.setDate([weekStart, weekEnd]);
                currentWeekStart = weekStart;
                currentWeekEnd = weekEnd;
                loadGovernorsData();
            }
        },
        onClose: function(selectedDates, dateStr, instance) {
            if (selectedDates.length !== 2 || selectedDates[0].getDay() !== 0 || selectedDates[1].getDay() !== 6) {
                alert("Please select a full week starting from Sunday.");
                instance.clear();
            }
        }
    });

    await loadGovernorsData();
});

async function loadGovernorsData() {
    const querySnapshot = await getDocs(collection(db, "Governors"));
    governors = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const governor = new Governor(
            data.rank,
            data.name,
            data.image,
            data.state,
            data.infrastructure,
            data.security,
            data.education,
            data.healthcare,
            data.jobs
        );
        governors.push(governor);
    });
    renderGovernors();
}

function renderGovernors() {
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 2) {
        governors.sort((a, b) => a.name.localeCompare(b.name));
    } else if (dayOfWeek >= 3 && dayOfWeek <= 6) {
        governors.sort((a, b) => {
            const totalVotesA = Object.values(a.categories).reduce((sum, cat) => sum + cat.votes, 0);
            const totalVotesB = Object.values(b.categories).reduce((sum, cat) => sum + cat.votes, 0);
            return totalVotesB - totalVotesA;
        });
    }

    const rowsHtml = governors.map((governor) => governor.render()).join('');
    document.getElementById('governor-rows').innerHTML = rowsHtml;

    document.querySelectorAll('.upvote-btn').forEach((btn) => {
        btn.addEventListener('click', handleVote);
    });

    document.querySelectorAll('.downvote-btn').forEach((btn) => {
        btn.addEventListener('click', handleVote);
    });
}

function handleVote(event) {
    const button = event.currentTarget;
    const id = parseInt(button.getAttribute('data-id'));
    const category = button.getAttribute('data-category');
    const type = button.classList.contains('upvote-btn') ? 'upvote' : 'downvote';

    const governor = governors.find((gov) => gov.rank === id);
    if (governor) {
        governor.vote(category, type);
    }
}
