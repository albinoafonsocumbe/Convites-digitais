import os
p = os.path.join(os.path.dirname(__file__), "src", "pages", "ConvitePublico.js")
open(p,'w',encoding='utf-8').write(open(os.path.join(os.path.dirname(__file__),'_cv_part1.txt'),encoding='utf-8').read())
print('ok',os.path.getsize(p))
