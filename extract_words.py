import re

def extract_words(filename, min_len=3, max_len=10):
    with open(filename, "r", encoding="utf-8") as file:
        text = file.read().lower()

    words = re.findall(r'\b[a-z]+\b', text)

    word_dict = {length: set() for length in range(min_len, max_len + 1)}
    for word in words:
        if min_len <= len(word) <= max_len:
            word_dict[len(word)].add(word)

    return word_dict

# 🔽 Add this block to make it run when the script is executed
if __name__ == "__main__":
    word_dict = extract_words("pride_and_prejudice")

    # Print how many words per length
    for length, word_set in word_dict.items():
        print(f"{length}-letter words: {len(word_set)} words")

    # Print a sample of 5-letter words
    print("\nSample 5-letter words:")
    print(sorted(list(word_dict[5])[:20]))
