#!/bin/bash

# Requeriment: pybadges (see https://github.com/google/pybadges)
# `pip install pybadges`

# Hint: to do a fast preview, replace '> filename.svg' with  '--browser', example:
## python -m pybadges --left-text='Label here' --right-text='Value here' --right-color='#26A65B' --browser

python -m pybadges --left-text='Status' --right-text='Work in Progress' --right-color='#FF773D' > status-work-in-progress.svg
python -m pybadges --left-text='English' --right-text='8 Tags' --right-color='#1E90FF' > language-en.svg
python -m pybadges --left-text='Español' --right-text='3 Etiquetas' --right-color='#1E90FF' > language-es.svg
python -m pybadges --left-text='Português' --right-text='4 Etiquetas' --right-color='#1E90FF' > language-pt.svg

python -m pybadges --left-text='GitHub' --right-text='fititnt/ais-ethics-tags' --right-color='#237c02' > github.svg
python -m pybadges --left-text='Website' --right-text='tags.etica.ai' --right-color='#237c02' > website.svg
