from rest_framework import generics
from .models import Elevator, ElevatorConfiguration
from .serializers import ElevatorSerializer, ElevatorConfigurationSerializer

class ElevatorRequestView(generics.CreateAPIView):
    queryset = Elevator.objects.all()
    serializer_class = ElevatorSerializer

class ElevatorStatusView(generics.ListAPIView):
    queryset = Elevator.objects.all()
    serializer_class = ElevatorSerializer

class ElevatorConfigView(generics.ListAPIView):
    queryset = ElevatorConfiguration.objects.all()
    serializer_class = ElevatorConfigurationSerializer
