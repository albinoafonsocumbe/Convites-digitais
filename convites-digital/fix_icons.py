import os
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
c = open(path, encoding="utf-8").read()
lines = c.split("\n")

svg = (
    "        {on"
    " ? <svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"white\">"
    "<rect x=\"1\" y=\"1\" width=\"3.5\" height=\"10\" rx=\"1\"/>"
    "<rect x=\"7.5\" y=\"1\" width=\"3.5\" height=\"10\" rx=\"1\"/>"
    "</svg>"
    " : <svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"white\">"
    "<polygon points=\"2,1 11,6 2,11\"/>"
    "</svg>}"
)

lines[26] = svg
open(path, "w", encoding="utf-8").write("\n".join(lines))
print("ok:", repr(lines[26][:60]))
