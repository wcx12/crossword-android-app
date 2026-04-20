# Crossword Android App

A crossword puzzle game app built with Kotlin and Jetpack Compose.

## Inspired by

This project is a Kotlin/Android port of [genxword](https://github.com/riverrun/genxword), a Python crossword generator originally created by [Peter H. Miller](https://github.com/riverrun).

## Features

- **Crossword Generation**: Automatically generates crossword puzzles using a greedy algorithm
- **Interactive Grid**: Tap cells to select, input letters via on-screen keyboard
- **Direction Toggle**: Switch between horizontal and vertical word directions
- **Hint System**: Shows current word and clue in the hint bar
- **Solution View**: Toggle to reveal or hide the solution
- **Custom Word Bank**: Support for importing custom word lists

## Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose with Material Design 3
- **Architecture**: Clean Architecture + MVVM
- **Min SDK**: 23 (Android 6.0)
- **Target SDK**: 36

## Project Structure

```
app/src/main/java/com/crossword/app/
├── MainActivity.kt              # Entry point
├── data/
│   ├── local/                    # Word loading & parsing
│   └── model/                    # Data models
├── domain/
│   ├── model/                    # Domain models (Crossword, Cell, Clue)
│   ├── repository/              # Repository interfaces
│   └── usecase/                 # CrosswordGenerator
└── ui/
    ├── game/                     # Game screen, ViewModel, state
    ├── theme/                    # Material3 theme
    └── wordbank/                 # Word bank management
```

## Algorithm

The crossword generator uses a greedy algorithm:

1. Place the first word (longest) at a random position
2. For remaining words, find intersection points using `letCoords` mapping
3. Score each possible position based on:
   - Base score of 1
   - +1 for each intersection with existing letters
4. Place words at the highest-scoring positions within time limit
5. Keep the best solution (most words placed)

## Building

```bash
./gradlew assembleDebug
```

## Screenshots

Screenshots are available in the parent directory.
