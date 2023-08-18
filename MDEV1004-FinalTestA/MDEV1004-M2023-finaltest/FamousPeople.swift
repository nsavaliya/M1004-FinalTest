//
//  FamousPeople.swift
//  MDEV1004-M2023-Final-Test
//
//  Created by Namrata Savaliya on 2023-08-18.
//
struct FamousPeople: Codable
{

    
    let _id: String
    let famouspeopleID: String
    let name: String
    let occupation: String
    let nationality: String
    let birthDate: String
    let birthPlace: String
    let bio: String
    let achievement: [String]
    let imageURL: String
}
