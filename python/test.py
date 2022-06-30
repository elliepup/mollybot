import time

class Testing:
    def __init__(self):
        print("This is a test")
    
    @staticmethod
    def hello():
        print("This is a second test")


if __name__ == "__main__":
    test = Testing()
    Testing.hello()