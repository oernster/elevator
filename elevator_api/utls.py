from django.urls import path
from .views import ElevatorRequestView, ElevatorStatusView, ElevatorConfigView

urlpatterns = [
    path('request/', ElevatorRequestView.as_view(), name='elevator-request'),
    path('status/', ElevatorStatusView.as_view(), name='elevator-status'),
    path('config/', ElevatorConfigView.as_view(), name='elevator-config'),
]
