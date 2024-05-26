import streamlit as st
from PIL import Image
import random

# Define the Adobe Spectrum design system
SPECTRUM_COLORS = {
    "white": "#FFFFFF",
    "gray-50": "#F5F5F5",
    "gray-75": "#E5E5E5",
    "gray-100": "#D1D1D1",
    "gray-200": "#B2B2B2",
    "gray-300": "#939393",
    "gray-400": "#747474",
    "gray-500": "#5A5A5A",
    "gray-600": "#404040",
    "gray-700": "#262626",
    "gray-800": "#171717",
    "gray-900": "#0C0C0C",
    "blue-400": "#0072C6",
    "blue-500": "#0057B8",
    "blue-600": "#003E9F",
    "blue-700": "#002A86",
    "blue-800": "#001A6D",
    "blue-900": "#000D54",
}

# Define the leaderboard data
governors = [
    {"name": "Babajide Sanwo-Olu", "image": "governor1.jpg", "education": 80, "health": 75, "security": 85},
    {"name": "Nyesom Wike", "image": "governor2.jpg", "education": 85, "health": 80, "security": 75},
    {"name": "Seyi Makinde", "image": "governor3.jpg", "education": 75, "health": 85, "security": 70},
    {"name": "Ifeanyi Okowa", "image": "governor4.jpg", "education": 80, "health": 75, "security": 80},
    {"name": "Abdullahi Ganduje", "image": "governor5.jpg", "education": 75, "health": 70, "security": 85},
    {"name": "Aminu Masari", "image": "governor6.jpg", "education": 70, "health": 80, "security": 75},
    {"name": "Nasir El-Rufai", "image": "governor7.jpg", "education": 85, "health": 75, "security": 80},
    {"name": "Rotimi Akeredolu", "image": "governor8.jpg", "education": 75, "health": 80, "security": 75},
    {"name": "Udom Emmanuel", "image": "governor9.jpg", "education": 80, "health": 75, "security": 70},
    {"name": "Bala Mohammed", "image": "governor10.jpg", "education": 75, "health": 70, "security": 80},
]

# Set the Streamlit page configuration
st.set_page_config(
    page_title="Nigerian Governors Leaderboard",
    page_icon=":trophy:",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Define the Streamlit app
def app():
    st.title("Nigerian Governors Leaderboard")

    # Add a dropdown to select the month
    selected_month = st.selectbox("Select Month", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])

    # Display the leaderboard
    st.write(f"Leaderboard for {selected_month}")
    for i, governor in enumerate(governors):
        col1, col2, col3, col4, col5, col6 = st.columns([1, 2, 3, 2, 2, 2])

        # Ranking number
        with col1:
            st.markdown(
                f"<p style='font-size: 16px; font-weight: bold; color: {SPECTRUM_COLORS['gray-600']};'>{i+1}.</p>",
                unsafe_allow_html=True,
            )

        # Governor image
        with col2:
            image = Image.open(f"images/{governor['image']}")
            st.image(image, width=36)

        # Governor name
        with col3:
            st.markdown(
                f"<p style='font-size: 16px; font-weight: bold; color: {SPECTRUM_COLORS['gray-800']};'>{governor['name']}</p>",
                unsafe_allow_html=True,
            )

        # Education metric
        with col4:
            st.markdown(
                f"<p style='font-size: 16px; font-weight: bold; color: {SPECTRUM_COLORS['blue-500']};'>{governor['education']}</p>",
                unsafe_allow_html=True,
            )

        # Health metric
        with col5:
            st.markdown(
                f"<p style='font-size: 16px; font-weight: bold; color: {SPECTRUM_COLORS['blue-500']};'>{governor['health']}</p>",
                unsafe_allow_html=True,
            )

        # Security metric
        with col6:
            st.markdown(
                f"<p style='font-size: 16px; font-weight: bold; color: {SPECTRUM_COLORS['blue-500']};'>{governor['security']}</p>",
                unsafe_allow_html=True,
            )

        st.markdown("<hr>", unsafe_allow_html=True)

if __name__ == "__main__":
    app()
