import streamlit as st
import pandas as pd

# Sample data for the leaderboard
data = {
    "Rank": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "Governor Image": [""] * 10,  # placeholder for governor images
    "Governor Name": ["Sanwo-Olu", "Makinde", "Fayemi", "Okowa", "Uzodinma", "Abiodun", "Akeredolu", "Bello", "Masari", "Lalong"],
    "State": ["Lagos", "Oyo", "Ekiti", "Delta", "Imo", "Ogun", "Ondo", "Kogi", "Katsina", "Plateau"],
    "Education": [8.5, 7.2, 9.1, 8.8, 6.5, 7.8, 8.2, 6.8, 7.5, 8.1],
    "Health": [7.1, 8.3, 6.9, 7.5, 5.8, 8.5, 7.9, 6.2, 7.1, 8.2],
    "Finance": [8.8, 7.9, 9.5, 8.5, 7.1, 8.1, 8.6, 7.4, 8.3, 9.2]
}

df = pd.DataFrame(data)

# Create a Streamlit app
st.title("Nigerian Governors' Leaderboard")
st.write("Ranking of top 10 Nigerian governors based on education, health, and finance metrics")

# Create a table with the leaderboard data
st.table(df)

# Add a placeholder for governor images
image_placeholder = st.columns([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
for i, img in enumerate(image_placeholder):
    img.image("https://via.placeholder.com/50", caption=f"Governor {i+1} Image", use_column_width=True)

# Add a selectbox to filter the leaderboard by metric
metric_selectbox = st.selectbox("Filter by metric:", ["Education", "Health", "Finance"])
if metric_selectbox:
    filtered_df = df.sort_values(by=metric_selectbox, ascending=False)
    st.table(filtered_df)
