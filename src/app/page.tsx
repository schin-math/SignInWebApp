'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { TARGET_LOCATION, PROXIMITY_RADIUS_FEET, GOOGLE_FORM_URL } from './constants'
import { Location } from './types'

export default function CheckInPage() {
	const [location, setLocation] = useState<Location | null>(null)
	const [locationError, setLocationError] = useState('')
	const [isLoadingLocation, setIsLoadingLocation] = useState(true)

	const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
		const R = 3959
		const dLat = (lat2 - lat1) * Math.PI / 180
		const dLng = (lng2 - lng1) * Math.PI / 180
		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLng / 2) * Math.sin(dLng / 2)
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
		const distanceMiles = R * c
		return distanceMiles * 5280
	}

	const isWithinProximity = (userLat: number, userLng: number): boolean => {
		const distanceInFeet = calculateDistance(userLat, userLng, TARGET_LOCATION.latitude, TARGET_LOCATION.longitude)
		return distanceInFeet <= PROXIMITY_RADIUS_FEET
	}

	const getCurrentLocation = () => {
		setIsLoadingLocation(true)
		setLocationError('')

		if (!navigator.geolocation) {
			setLocationError('Geolocation is not supported by this browser')
			setIsLoadingLocation(false)
			return
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLocation({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				})
				setIsLoadingLocation(false)
			},
			(error) => {
				setLocationError(`Location error: ${error.message}`)
				setIsLoadingLocation(false)
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			}
		)
	}

	// Auto-request location on page load
	useEffect(() => {
		getCurrentLocation()
	}, [])

	const getLocationStatus = () => {
		if (isLoadingLocation) return '📍 Getting location...'
		if (!location) return '📍 Location not detected'

		const distanceInFeet = calculateDistance(location.latitude, location.longitude, TARGET_LOCATION.latitude, TARGET_LOCATION.longitude)
		const distanceInMiles = (distanceInFeet / 5280).toFixed(1)
		const isWithin = distanceInFeet <= PROXIMITY_RADIUS_FEET

		return isWithin
			? `Within range`
			: `You are ${distanceInMiles}mi away from the target location`
	}

	const isInRange = location && isWithinProximity(location.latitude, location.longitude)

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Math Ma MQC Shift Check In</h1>

				<div className="space-y-6">
					{/* Location Status Section */}
					<div className="text-center">
						<div className="flex items-center justify-center space-x-2 mb-2">
							<span className={`text-2xl ${isInRange ? 'text-green-500' : isLoadingLocation ? 'text-gray-500' : 'text-amber-500'}`}>
								{isLoadingLocation ? '📍' : isInRange ? '✅' : '⚠️'}
							</span>
							<span className={`font-medium ${isLoadingLocation ? 'text-gray-600' :
								isInRange ? 'text-green-600' : 'text-amber-600'
								}`}>
								{getLocationStatus()}
							</span>
						</div>

						{locationError && (
							<div className="mb-4">
								<p className="text-amber-600 text-sm mb-2">{locationError}</p>
								<Button
									onClick={getCurrentLocation}
									variant="outline"
									size="sm"
								>
									Retry
								</Button>
							</div>
						)}
					</div>

					{/* Google Form Section */}
					{isInRange && (
						<div>
							<div className="text-center mb-4">
								<p className="text-gray-600">Please fill out the form below to check in for your shift.</p>
							</div>
							<div className="border rounded-lg overflow-hidden">
								<iframe
									src={`${GOOGLE_FORM_URL}`}
									width="100%"
									height="600"
									frameBorder="0"
									marginHeight={0}
									marginWidth={0}
									className="w-full"
								>
									Loading form...
								</iframe>
							</div>
						</div>
					)}

					{!isInRange && !isLoadingLocation && (
						<div className="text-center">
							<h2 className="text-xl font-semibold text-red-700 mb-2">You are not in range</h2>
							<p className="text-gray-600 mb-4">You need to be within {PROXIMITY_RADIUS_FEET} feet of the target location to check in normally.</p>

							{/* <Button
								onClick={() => {
									// Show the form anyway
									const formSection = document.getElementById('fallback-form')
									if (formSection) {
										formSection.style.display = 'block'
									}
								}}
								variant="outline"
								className="mb-4"
							>
								Submit Anyway
							</Button> */}

							{/* <div id="fallback-form" style={{ display: 'none' }}>
								<div className="border rounded-lg overflow-hidden">
									<iframe
										src={`${GOOGLE_FORM_URL}`}
										width="100%"
										height="600"
										frameBorder="0"
										marginHeight={0}
										marginWidth={0}
										className="w-full"
									>
										Loading form...
									</iframe>
								</div>
							</div> */}
						</div>
					)}

				</div>
			</div>
		</div>
	)
}