import cv2
import cv2.data

# Load pre-trained Haar Cascade model
modelpath = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
trainedMachine = cv2.CascadeClassifier(modelpath)

# Open camera
camera = cv2.VideoCapture(0)

while True:
    status, frame = camera.read()
    if not status:
        break

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = trainedMachine.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    # Draw rectangles on faces
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 255, 255), 3)

    # Show the frame with faces
    cv2.imshow("Faces", frame)

    # Break on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
camera.release()
cv2.destroyAllWindows()
