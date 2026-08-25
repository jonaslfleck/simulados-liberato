import re
def parse_gabarito(text):
    answers={}
    for n,a in re.findall(r"(?m)\b(\d{1,2})\s*[-–.]?\s*([ABCDE])\b",text.upper()):
        answers[int(n)]=a
    return answers
