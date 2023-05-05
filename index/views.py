from django.shortcuts import render

# Create your views here.
def indexs(req):
    return render(req,'index.html')