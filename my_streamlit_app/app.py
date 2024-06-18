import streamlit as st

# Load your HTML content
with open("alert.html", "r") as file:
    html_content = file.read()

# Use an iframe to display the HTML content
st.title("Success Alert Example")
st.components.v1.html(html_content, width=None, height=400, scrolling=True)
