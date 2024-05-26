import streamlit as st
from PIL import Image

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
    {"name": "Babajide Sanwo-Olu", "profile_url": "babajide_sanwo_olu", "education": 80, "health": 75, "security": 85},
    {"name": "Nyesom Wike", "profile_url": "nyesom_wike", "education": 85, "health": 80, "security": 75},
    {"name": "Seyi Makinde", "profile_url": "seyi_makinde", "education": 75, "health": 85, "security": 70},
    {"name": "Ifeanyi Okowa", "profile_url": "ifeanyi_okowa", "education": 80, "health": 75, "security": 80},
    {"name": "Abdullahi Ganduje", "profile_url": "abdullahi_ganduje", "education": 75, "health": 70, "security": 85},
    {"name": "Aminu Masari", "profile_url": "aminu_masari", "education": 70, "health": 80, "security": 75},
    {"name": "Nasir El-Rufai", "profile_url": "nasir_el_rufai", "education": 85, "health": 75, "security": 80},
    {"name": "Rotimi Akeredolu", "profile_url": "rotimi_akeredolu", "education": 75, "health": 80, "security": 75},
    {"name": "Udom Emmanuel", "profile_url": "udom_emmanuel", "education": 80, "health": 75, "security": 70},
    {"name": "Bala Mohammed", "profile_url": "bala_mohammed", "education": 75, "health": 70, "security": 80},
]

# Set the Streamlit page configuration
st.set_page_config(
    page_title="Nigerian Governors Leaderboard",
    page_icon=":trophy:",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Define the governor profile pages
def governor_profile(profile_url):
    st.set_page_config(
        page_title=f"{profile_url.replace('_', ' ').title()} Profile",
        page_icon=":bust_in_silhouette:",
        layout="centered",
        initial_sidebar_state="collapsed",
    )

    st.title(f"{profile_url.replace('_', ' ').title()} Profile")
    # Add content for the governor's profile page
    st.write("This is the profile page for the selected governor.")

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

        # Governor image placeholder
        with col2:
            st.markdown(
                f"<div style='width: 36px; height: 36px; background-color: {SPECTRUM_COLORS['gray-200']}; border-radius: 50%;'></div>",
                unsafe_allow_html=True,
            )

        # Governor name (clickable)
        with col3:
            st.markdown(
                f"<a href='/governor/{governor['profile_url']}' style='font-size: 16px; font-weight: bold; color: {SPECTRUM_COLORS['white']}; text-decoration: none;'>{governor['name']}</a>",
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

    # Define the routes for the governor profile pages
    for governor in governors:
        st.route(f"/governor/{governor['profile_url']}")(lambda profile_url=governor['profile_url']: governor_profile(profile_url))

if __name__ == "__main__":
    app()
